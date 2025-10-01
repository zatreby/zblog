<?php
// PHP Headless CMS Backend API
// Simple RESTful API for blog posts with SQLite database

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers - allow requests from Next.js frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
define('DB_FILE', __DIR__ . '/blog.db');

// Initialize database connection
function getDB() {
    try {
        $db = new PDO('sqlite:' . DB_FILE);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create posts table if it doesn't exist
        $db->exec("
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ");
        
        return $db;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

// Generate UUID v4
function generateUUID() {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

// Parse request URI
function parseRequest() {
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remove base path if present
    $uri = str_replace('/api', '', $uri);
    $uri = trim($uri, '/');
    $segments = explode('/', $uri);
    
    return [
        'method' => $method,
        'resource' => $segments[0] ?? '',
        'id' => $segments[1] ?? null
    ];
}

// Validate post data
function validatePostData($data, $isUpdate = false) {
    $errors = [];
    
    if (!$isUpdate) {
        if (empty($data['title'])) {
            $errors[] = 'Title is required';
        }
        if (empty($data['content'])) {
            $errors[] = 'Content is required';
        }
    } else {
        if (isset($data['title']) && empty($data['title'])) {
            $errors[] = 'Title cannot be empty';
        }
        if (isset($data['content']) && empty($data['content'])) {
            $errors[] = 'Content cannot be empty';
        }
        if (empty($data['title']) && empty($data['content'])) {
            $errors[] = 'At least one field (title or content) must be provided';
        }
    }
    
    return $errors;
}

// API Endpoints

// GET all posts
function getAllPosts($db) {
    try {
        $stmt = $db->query("SELECT * FROM posts ORDER BY created_at DESC");
        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $posts,
            'count' => count($posts)
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch posts: ' . $e->getMessage()]);
    }
}

// GET post by ID
function getPostById($db, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($post) {
            echo json_encode([
                'success' => true,
                'data' => $post
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch post: ' . $e->getMessage()]);
    }
}

// POST create new post
function createPost($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    $errors = validatePostData($input);
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['error' => 'Validation failed', 'errors' => $errors]);
        return;
    }
    
    try {
        $id = generateUUID();
        $stmt = $db->prepare("
            INSERT INTO posts (id, title, content, created_at, last_modified) 
            VALUES (:id, :title, :content, datetime('now'), datetime('now'))
        ");
        
        $stmt->execute([
            'id' => $id,
            'title' => $input['title'],
            'content' => $input['content']
        ]);
        
        // Fetch the created post
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Post created successfully',
            'data' => $post
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create post: ' . $e->getMessage()]);
    }
}

// PATCH update post
function updatePost($db, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input
    $errors = validatePostData($input, true);
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['error' => 'Validation failed', 'errors' => $errors]);
        return;
    }
    
    try {
        // Check if post exists
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
            return;
        }
        
        // Build update query dynamically
        $updates = [];
        $params = ['id' => $id];
        
        if (isset($input['title'])) {
            $updates[] = "title = :title";
            $params['title'] = $input['title'];
        }
        
        if (isset($input['content'])) {
            $updates[] = "content = :content";
            $params['content'] = $input['content'];
        }
        
        $updates[] = "last_modified = datetime('now')";
        
        $sql = "UPDATE posts SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        
        // Fetch updated post
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Post updated successfully',
            'data' => $post
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update post: ' . $e->getMessage()]);
    }
}

// DELETE post
function deletePost($db, $id) {
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Post ID is required']);
        return;
    }
    
    try {
        // Check if post exists
        $stmt = $db->prepare("SELECT * FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => 'Post not found']);
            return;
        }
        
        // Delete post
        $stmt = $db->prepare("DELETE FROM posts WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Post deleted successfully',
            'deleted_post' => $post
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete post: ' . $e->getMessage()]);
    }
}

// Main router
function route() {
    $db = getDB();
    $request = parseRequest();
    
    if ($request['resource'] !== 'posts') {
        http_response_code(404);
        echo json_encode(['error' => 'Resource not found']);
        return;
    }
    
    switch ($request['method']) {
        case 'GET':
            if ($request['id']) {
                getPostById($db, $request['id']);
            } else {
                getAllPosts($db);
            }
            break;
            
        case 'POST':
            createPost($db);
            break;
            
        case 'PATCH':
            updatePost($db, $request['id']);
            break;
            
        case 'DELETE':
            deletePost($db, $request['id']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
}

// Run the application
route();

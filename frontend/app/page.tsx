'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  last_modified: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zblogger.wuaze.com/api';

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      const data = await response.json();
      setPosts([data.data, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
      setPosts(posts.filter(post => post.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-indigo-600 animate-pulse">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-red-600 text-xl mb-4">Error: {error}</div>
          <button 
            onClick={fetchPosts}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              JAMstack Blog
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105"
              >
                {showCreateForm ? 'Cancel' : '+ New Post'}
              </button>
              <button
                onClick={fetchPosts}
                className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Create Post Form */}
      {showCreateForm && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <form onSubmit={handleCreatePost} className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Post</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Enter post title..."
                disabled={creating}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-32 resize-none"
                placeholder="Write your content here..."
                disabled={creating}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {creating ? 'Creating...' : 'Create Post'}
            </button>
          </form>
        </div>
      )}

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No posts yet</div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="text-sm text-gray-500 mb-4">
                    <div>Created: {formatDate(post.created_at)}</div>
                    {post.last_modified !== post.created_at && (
                      <div>Modified: {formatDate(post.last_modified)}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="flex-1 text-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      View
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="flex-1 text-center px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

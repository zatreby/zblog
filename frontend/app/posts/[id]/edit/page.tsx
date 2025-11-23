'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  last_modified: string;
}

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [editedPost, setEditedPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/posts/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Post not found');
        }
        throw new Error('Failed to fetch post');
      }
      const data = await response.json();
      setPost(data.data);
      setEditedPost({ title: data.data.title, content: data.data.content });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !editedPost.title.trim() || !editedPost.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'PATCH', // Assuming PATCH for partial updates; use 'PUT' if your API requires full updates
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPost),
      });

      if (!response.ok) throw new Error('Failed to update post');
      
      router.push(`/posts/${post.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-indigo-600 animate-pulse">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <div className="text-red-600 text-xl mb-4">{error || 'Post not found'}</div>
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link
              href={`/posts/${post.id}`}
              className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2"
            >
              <span>←</span> Back to Post
            </Link>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Post</h1>
          <form onSubmit={handleUpdatePost}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
              <input
                type="text"
                value={editedPost.title}
                onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
                placeholder="Enter post title..."
                disabled={updating}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Content (Markdown)</label>
              <textarea
                value={editedPost.content}
                onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 h-48 resize-y font-mono text-sm"
                placeholder="Write your content in Markdown format...&#10;&#10;Example:&#10;# Heading&#10;**Bold text**&#10;*Italic text*&#10;- List item"
                disabled={updating}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {updating ? 'Updating...' : 'Update Post'}
              </button>
              <Link
                href={`/posts/${post.id}`}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

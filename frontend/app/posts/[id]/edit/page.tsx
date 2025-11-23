'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen bg-base-50 flex items-center justify-center">
        <div className="text-lg text-slate-600 font-medium">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-base-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border border-base-200 shadow-sm p-8 max-w-md">
          <div className="text-base-900 text-lg font-medium mb-4">{error || 'Post not found'}</div>
          <Link 
            href="/"
            className="inline-block px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-50">
      {/* Header */}
      <header className="bg-white border-b border-base-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link
              href={`/posts/${post.id}`}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Post
            </Link>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-base-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-semibold text-base-900 mb-6">Edit Post</h1>
          <form onSubmit={handleUpdatePost}>
            <div className="mb-5">
              <label htmlFor="title" className="block text-sm font-medium text-base-700 mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={editedPost.title}
                onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-base-900 placeholder-base-400"
                placeholder="Enter post title..."
                disabled={updating}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-base-700 mb-2">
                Content (Markdown)
              </label>
              <textarea
                id="content"
                value={editedPost.content}
                onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 h-64 resize-y font-mono text-sm text-base-900 placeholder-base-400"
                placeholder="Write your content in Markdown format...&#10;&#10;Example:&#10;# Heading&#10;**Bold text**&#10;*Italic text*&#10;- List item"
                disabled={updating}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-accent-600 text-white rounded-md hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {updating ? 'Updating...' : 'Update Post'}
              </button>
              <Link
                href={`/posts/${post.id}`}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
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

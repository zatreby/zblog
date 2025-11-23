'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { toast } from 'sonner';
import { AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  last_modified: string;
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!post) return;

    try {
      setDeleting(true);
      const response = await fetch(`${API_URL}/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
      toast.success('Post deleted successfully');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete post');
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
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
              href="/"
              className="text-slate-600 hover:text-slate-900 flex items-center gap-2 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <div className="flex gap-3">
              <Link
                href={`/posts/${post.id}/edit`}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
              >
                Edit
              </Link>
              <button
                onClick={handleDeleteClick}
                className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg border border-base-200 shadow-sm overflow-hidden">
          <div className="border-b border-base-200 px-6 sm:px-8 py-8">
            <h1 className="text-3xl font-semibold text-base-900 mb-4 tracking-tight">{post.title}</h1>
            <div className="text-sm text-slate-600 space-y-1">
              <div>Created: {formatDate(post.created_at)}</div>
              {post.last_modified !== post.created_at && (
                <div>Last modified: {formatDate(post.last_modified)}</div>
              )}
            </div>
          </div>
          
          <div className="px-6 sm:px-8 py-8">
            <div className="prose prose-slate prose-lg max-w-none text-base-800 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          <div className="bg-base-50 border-t border-base-200 px-6 sm:px-8 py-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="text-xs text-slate-500 font-mono">
                Post ID: <code className="bg-base-200 px-2 py-1 rounded text-slate-700">{post.id}</code>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
                >
                  Edit Post
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors font-medium"
                >
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>

      {/* Delete Confirmation Modal */}
      {post && (
        <Dialog open={showDeleteModal} onClose={handleDeleteCancel} className="relative z-50">
          <div className="fixed inset-0 bg-base-900/50" aria-hidden="true" />
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="max-w-lg space-y-4 bg-white rounded-lg border border-base-200 shadow-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-50 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              
              <DialogTitle className="text-lg font-semibold text-base-900 text-center">
                Delete Post
              </DialogTitle>
              
              <p className="text-slate-600 text-center text-sm">
                Are you sure you want to delete <span className="font-medium text-base-900">"{post.title}"</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </div>
  );
}

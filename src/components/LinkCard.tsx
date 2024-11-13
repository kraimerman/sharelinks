import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Edit2, X, Check, Lock } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  description: string;
  author: string;
  timestamp: Date;
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  onVoteUpdate: (type: 'upvote' | 'downvote', newValue: number) => void;
  onAddComment: (comment: { text: string }) => void;
  onEditLink: (updates: { title: string; url: string; description: string }) => void;
  isAuthenticated: boolean;
  currentUser?: string | null; // Add currentUser prop
}

export default function LinkCard({
  id,
  title,
  url,
  description,
  author,
  timestamp,
  upvotes = 0,
  downvotes = 0,
  comments = [],
  onVoteUpdate,
  onAddComment,
  onEditLink,
  isAuthenticated,
  currentUser,
}: LinkCardProps) {
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedUrl, setEditedUrl] = useState(url);
  const [editedDescription, setEditedDescription] = useState(description);

  const canEdit = isAuthenticated && currentUser === author;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return;

    if (type === 'upvote') {
      const newUpvotes = localUpvotes + 1;
      setLocalUpvotes(newUpvotes);
      await onVoteUpdate('upvote', newUpvotes);
    } else {
      const newDownvotes = localDownvotes + 1;
      setLocalDownvotes(newDownvotes);
      await onVoteUpdate('downvote', newDownvotes);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting || !isAuthenticated) return;

    setIsSubmitting(true);
    try {
      await onAddComment({ text: newComment });
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedTitle.trim() || !editedUrl.trim() || !isAuthenticated || !canEdit) return;

    try {
      await onEditLink({
        title: editedTitle,
        url: editedUrl,
        description: editedDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(title);
    setEditedUrl(url);
    setEditedDescription(description);
    setIsEditing(false);
  };

  const displayUrl = url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-4 transition-all hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={editedUrl}
                  onChange={(e) => setEditedUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    {title}
                    <span className="mx-2 text-gray-400">—</span>
                    <span className="text-gray-600 font-normal text-base">
                      {displayUrl}
                    </span>
                  </h2>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100"
                    title="Edit link"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-600 flex-shrink-0"
                  title="Open link in new tab"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <p className="text-gray-600 mt-2">{description}</p>
              <div className="text-sm text-gray-500 mt-2">
                Shared by {author} • {new Date(timestamp).toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('upvote')}
                  className={`p-1 rounded-full transition-colors ${
                    isAuthenticated
                      ? 'hover:bg-gray-100 cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  title={isAuthenticated ? 'Upvote' : 'Sign in to vote'}
                >
                  <ThumbsUp size={18} className="text-green-600" />
                </button>
                <span className="text-green-600 font-medium">{localUpvotes}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('downvote')}
                  className={`p-1 rounded-full transition-colors ${
                    isAuthenticated
                      ? 'hover:bg-gray-100 cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  title={isAuthenticated ? 'Downvote' : 'Sign in to vote'}
                >
                  <ThumbsDown size={18} className="text-red-600" />
                </button>
                <span className="text-red-600 font-medium">{localDownvotes}</span>
              </div>
            </div>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <MessageCircle size={18} />
              <span>{comments.length} comments</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4">
              {isAuthenticated ? (
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center justify-center gap-2 text-gray-500">
                  <Lock size={16} />
                  <span>Please sign in to comment</span>
                </div>
              )}

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-gray-800">{comment.author}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
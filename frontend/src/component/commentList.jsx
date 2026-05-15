import { useAuth } from '../context/AuthContext';
import { createComment, deleteComment, updateComment, getCommentsByProject } from '../api/api';
import { useState, useEffect } from 'react';
import Comment from './comment';
import './css/comment.css';


const CommentList = ({ projectId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const loadComments = async () => {
      try {
        const data = await getCommentsByProject(projectId);
        setComments(data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) loadComments();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await createComment({ content: newComment, project_id: projectId });

      const enrichedComment = {
        comment_id: res.commentId,
        username: user.username,
        profile_picture: user.profile_picture,
        user_id: user.user_id,
        content: newComment,
        created_at: new Date().toISOString(),
      };

      setComments(prev => [enrichedComment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.comment_id !== id));
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleUpdate = async (id, updatedText) => {
    try {
      await updateComment(id, { content: updatedText });

      const enrichedUpdate = {
        comment_id: id,
        username: user.username,
        profile_picture: user.profile_picture,
        user_id: user.user_id,
        content: updatedText,
        created_at: new Date().toISOString(),
      };

      setComments(prev =>
        prev.map(c => (c.comment_id === id ? enrichedUpdate : c))
      );
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const isAdmin = user?.roles?.some(role => role.name === 'admin');

  return (
    <div className="comment-wrapper">
      <h3>Comments</h3>

      {user && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write your comment..."
            required
          />
          <button type="submit">Post Comment</button>
        </form>
      )}

      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments for this project.</p>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment.comment_id}
            comment={comment}
            currentUser={user}
            isAdmin={isAdmin}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
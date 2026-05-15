import { useState } from 'react';
import './css/comment.css';

const Comment = ({ comment, currentUser, isAdmin, onDelete, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment.content);

    const isOwner = currentUser?.user_id === comment.user_id;

    const handleEdit = () => setEditing(true);
    const handleSave = () => {
        onUpdate(comment.comment_id, editedText);
        setEditing(false);
    };

    return (
        <div className="comment-card">
            <div className="comment-header">
                <img
                    src={`http://88.200.63.148:12345/${comment.profile_picture}`}
                    alt={`${comment.username}'s avatar`}
                    className="comment-avatar"
                />
                <div className="comment-user-info">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-date">
                        {new Date(comment.created_at).toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="comment-body">
                {editing ? (
                    <>
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="comment-edit-area"
                        />
                        <button className="comment-btn" onClick={handleSave}>Save</button>
                    </>
                ) : (
                    <p className="comment-text">{comment.content}</p>
                )}
            </div>

            {(isOwner || isAdmin) && (
                <div className="comment-actions">
                    {isOwner && !editing && (
                        <button className="comment-action-btn" onClick={handleEdit}>Edit</button>
                    )}
                    <button className="comment-action-btn delete" onClick={() => onDelete(comment.comment_id)}>Delete</button>
                </div>
            )}
        </div>
    );
};

export default Comment;
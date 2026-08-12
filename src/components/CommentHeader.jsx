import { useState } from "react";

export default function CommentHeader({comment, currentUser, onDelete, onReply, onEdit, isEditing, onUpdate}) {
    const [editText, setEditText] = useState(comment.content);

    function handleSaveUpdate() {
        if (!editText.trim()) return;
        onUpdate(comment.id, editText);
        onEdit();
    }

    return (
        <>
            <div className="comment-header">
                <div className="comment-details">
                    <img src={comment.user.image.webp} alt={comment.user.username}></img>
                    <p className="username">{comment.user.username}</p>
                    {comment.user.username === currentUser.username && <span className="user-badge">you</span>}
                    <p className="date">{comment.createdAt}</p>
                </div>
                <div className="comment-actions">
                    {
                        comment.user.username === currentUser.username ? 
                        (<>
                            <button
                                type="button"
                                className="delete-btn"
                                onClick={() => onDelete(comment.id)}
                            >
                                <img src="./images/icon-delete.svg" alt=""></img>
                                <span>Delete</span>
                            </button>
                            <button
                                type="button"
                                className="edit-btn"
                                onClick={onEdit}
                            >
                                <img src="./images/icon-edit.svg" alt=""></img>
                                <span>Edit</span>
                            </button>
                        </>):
                        (<button
                            type="button"
                            className="reply-btn"
                            onClick={onReply}
                        >
                            <img src="./images/icon-reply.svg" alt=""></img>
                            <span>Reply</span>
                        </button>)
                    }
                </div>
            </div>
            {isEditing ? (
                <div className="comment-body">
                    <textarea 
                    rows="3" 
                    value={editText} 
                    onChange={(e) => setEditText(e.target.value)} 
                    />
                    <button 
                        type="button" 
                        className="btn-update" 
                        onClick={handleSaveUpdate}
                    >
                        UPDATE
                    </button>
                </div>
                ) : (
                <div className="comment-body">
                    <p>
                        {comment.replyingTo && <span className="replying-to">@{comment.replyingTo} </span>}
                        {comment.content}
                    </p>
                </div>
                )}
        </> 
    )
}
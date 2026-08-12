import ScoreCounter from "./ScoreCounter";
import CommentHeader from "./CommentHeader";
import CommentForm from "./CommentForm";
import {useState} from 'react';


export default function Card({comment, currentUser, onDelete, onEdit, onReply, onUpdate, onScoreChange}) {

    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);


    function handleSendReply(text) {
      onReply(comment.id, text, comment.user.username);
      setIsReplying(false);
    }

    return (   
    <div className="comment-thread">
        <article className="comment-card">
            <ScoreCounter comment={comment} onScoreChange={onScoreChange}/>
            <div className="comment-container-right">
                <CommentHeader 
                    comment={comment} 
                    currentUser={currentUser} 
                    onDelete={onDelete}
                    onReply={() => setIsReplying(!isReplying)}
                    onEdit={() => setIsEditing(!isEditing)}
                    isEditing={isEditing}
                    onUpdate={onUpdate}
                />
            </div>
        </article>
        {comment.replies && comment.replies.length > 0 && 
            <div className="reply-container">
                {comment.replies.map(reply => (
                    <Card 
                        key={reply.id}
                        comment={reply} 
                        currentUser={currentUser}
                        onDelete={onDelete}
                        onReply={onReply}
                        onUpdate={onUpdate}
                        onScoreChange={onScoreChange}
                    />
                ))}
            </div>
        }
        {isReplying && (
            <CommentForm 
                currentUser={currentUser}
                buttonText='Reply' 
                onSubmit={handleSendReply}
                onClick={onEdit}
            />
        )
        }
    </div>
    )
}
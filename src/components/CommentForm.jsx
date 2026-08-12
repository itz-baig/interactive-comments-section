import { useState } from "react";

export default function CommentForm({currentUser, buttonText = 'Send', onSubmit}) {
    const [text,setText] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText('');
    }
    return (
        <form className="add-comment-card" onSubmit={handleSubmit}>
            <img src={currentUser.image.webp} alt=""></img>
            <textarea 
                name="comment" 
                id="comment" 
                rows="3" 
                placeholder="Add a comment..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
            ></textarea>
            <button 
                type="submit" 
            >
                {buttonText}
            </button>
        </form>
    )
}
export default function ScoreCounter({comment, onScoreChange}) {
    return (
        <div className="comment-container-left">
            <button className="score-btn" 
                onClick={() => onScoreChange(comment.id, 1)}
                aria-label="Upvote comment">
                <img src="./images/icon-plus.svg" alt="" />
            </button>
            <p>{comment.score}</p>
            <button className="score-btn" 
                onClick={() => onScoreChange(comment.id, -1)} 
                aria-label="Downvote comment">
                <img src="./images/icon-minus.svg" alt="" />
            </button>
        </div>
    )
}
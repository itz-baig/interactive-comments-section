let appData = {
    currentUser: null,
    comments: []
};

let commentToDeleteId = null;

async function initApp() {
    const savedData = localStorage.getItem('comment_app_data');

    if (savedData) {
        appData = JSON.parse(savedData);
    } else {
        try {
            const response = await fetch('./data.json');
            appData = await response.json();
            saveData();
        } catch (error) {
            console.log('Error Loading Data: ', error);
        }
    }

    renderApp();
}


initApp();

function createComment(commentData){

    const isCurrentUser = commentData.user.username === appData.currentUser.username;

    const userBadge = isCurrentUser ? '<span class="user-badge">you</span>' : '';

    const replyingToText = commentData.replyingTo ? `<span class="replying-to">@${commentData.replyingTo}</span>` : '';

    const actionButtons = isCurrentUser ? ` <button type="button" class="delete-btn">
                                                <img src="./images/icon-delete.svg" alt="">
                                                <span>Delete</span>
                                            </button>
                                            <button type="button" class="edit-btn">
                                                <img src="./images/icon-edit.svg" alt="">
                                                <span>Edit</span>
                                            </button>` : 
                                            `<button type="button" class="reply-btn">
                                                <img src="./images/icon-reply.svg" alt="">
                                                <span>Reply</span>
                                            </button>`;
    
    return `<article class="comment-card" data-id="${commentData.id}">
                <div class="comment-container-left">
                    <button type="button" class="score-btn"><img src="./images/icon-plus.svg" alt=""></button>
                    <p>${commentData.score}</p>
                    <button type="button" class="score-btn"><img src="./images/icon-minus.svg" alt=""></button>
                </div>
                <div class="comment-container-right">
                    <div class="comment-header">
                        <div class="comment-details">
                            <img src="${commentData.user.image.png}" alt="${commentData.user.username}'s avatar">
                            <p class="username">${commentData.user.username}</p>
                            ${userBadge}
                            <p class="date">${commentData.createdAt}</p>
                        </div>
                        <div class="comment-actions">
                            ${actionButtons}
                        </div>
                    </div>
                    <div class="comment-body">
                        <p>${replyingToText} ${commentData.content}</p>
                    </div>
                </div>
            </article>`;
}

function renderApp(){
    const commentsList = document.querySelector('.comments-list');
    let fullHTML = '';

    appData.comments.forEach(comment => {
        fullHTML += createComment(comment);

        if(comment.replies && comment.replies.length > 0) {
            let repliesHTML = '';

            comment.replies.forEach(reply => {
                repliesHTML += createComment(reply);
            });
            fullHTML += `<div class="reply-container">
                            ${repliesHTML}
                         </div>`;
        }
    });
    
    fullHTML += `<form class="add-comment-card">
                    <img src="${appData.currentUser.image.png}" alt="${appData.currentUser.username}'s avatar">
                    <textarea name="comment" id="comment" rows="3" placeholder="Add a comment..."></textarea>
                    <button type="submit">Send</button>
                </form>`;

    commentsList.innerHTML = fullHTML;

    const commentTextarea = document.querySelector('#comment');

    if(commentTextarea){
        commentTextarea.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = `${this.scrollHeight}px`;
        });
    }

    const addCommentForm = document.querySelector('.add-comment-card');
    if(addCommentForm){
        addCommentForm.addEventListener('submit', handleAddComment);
    }

    saveData();
}


function saveData(){
    localStorage.setItem('comment_app_data', JSON.stringify(appData));
}

function handleAddComment(e){
    e.preventDefault();
    const textarea = document.querySelector('#comment');
    const textContent = textarea.value.trim();

    if(!textContent) return;

    const newComment = {
        id: Date.now(),
        content: textContent,
        createdAt: 'Just now',
        score: 0,
        user: appData.currentUser,
        replies: []
    };

    appData.comments.push(newComment);
    textarea.value = '';
    renderApp();
}

const commentsList = document.querySelector('.comments-list');

commentsList.addEventListener('click', function(e) {
    const scoreBtn = e.target.closest('.score-btn');
    const replyBtn = e.target.closest('.reply-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    const editBtn = e.target.closest('.edit-btn');


    if (scoreBtn){
        const commentCard = scoreBtn.closest('.comment-card');
        const commentId = Number(commentCard.dataset.id);
        const isPlus = scoreBtn.querySelector('img').src.includes('icon-plus.svg');
        
        handleScoreChange(commentId, isPlus ? 1 : -1);
    }

    if(replyBtn){
        const commentCard = replyBtn.closest('.comment-card');
        const commentId = Number(commentCard.dataset.id);
        const username = commentCard.querySelector('.username').textContent;

        toggleReplyForm(commentCard, commentId, username);
    }


    if (deleteBtn){
        const commentCard = deleteBtn.closest('.comment-card');
        commentToDeleteId = Number(commentCard.dataset.id);

        document.querySelector('#delete-modal').classList.remove('hidden');
    }

    if (editBtn) {
        const commentCard = editBtn.closest('.comment-card');
        const commentId = Number(commentCard.dataset.id);
        toggleEditMode(commentCard, commentId);
    }

});


document.querySelector('#modal-cancel').addEventListener('click', function() {
    document.querySelector('#delete-modal').classList.add('hidden');
    commentToDeleteId = null;
});

document.querySelector('#modal-confirm').addEventListener('click', function() {
    if (commentToDeleteId !== null) {

        appData.comments = appData.comments.filter(c => c.id !== commentToDeleteId);

        appData.comments.forEach(comment => {
            if (comment.replies) {
                comment.replies = comment.replies.filter(r => r.id !== commentToDeleteId);
            }
        });

        document.querySelector('#delete-modal').classList.add('hidden');
        commentToDeleteId = null;
        renderApp();
    }
});

function handleScoreChange(id,change){

    let target = appData.comments.find(c => c.id === id);
    if(!target){
        
        for (const comment of appData.comments){

            const foundReply = comment.replies.find(r => r.id === id);

            if(foundReply){
                target = foundReply;
                break;
            }
        }
    }

    if(target){
        target.score = Math.max(0, target.score + change);
        renderApp();
    }  
}

function toggleReplyForm(cardElement, targetId, replyingToUser){
    
    const existingForm = document.querySelector('.reply-form-card');
    if (existingForm){

        if(existingForm.dataset.targetId === targetId){
            existingForm.remove();
            return;
        }

        existingForm.remove();
    }

    const replyForm = document.createElement('form');
    replyForm.className = 'add-comment-card reply-form-card';
    replyForm.dataset.targetId = targetId;

    replyForm.innerHTML = `
        <img src="${appData.currentUser.image.png}" alt="${appData.currentUser.username}'s avatar">
        <textarea name="comment" id="comment" rows="3" placeholder="">@${replyingToUser} </textarea>
        <button type="submit">Reply</button>
    </form>`;
    
    cardElement.after(replyForm);
    replyForm.addEventListener('submit', handleAddReply);

    const textarea = replyForm.querySelector('textarea');
    textarea.focus();
    
    const textLength = textarea.value.length;
    textarea.setSelectionRange(textLength, textLength);

    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    });
}

function toggleEditMode(commentCard, commentId) {
    const commentBody = commentCard.querySelector('.comment-body');

    if (commentCard.classList.contains('is-editing')) return;
    commentCard.classList.add('is-editing');

    const paragraph = commentBody.querySelector('p');
    const replyingToSpan = paragraph.querySelector('.replying-to');
    
    const currentText = paragraph.textContent.replace(replyingToSpan ? replyingToSpan.textContent : '', '').trim();

    commentBody.innerHTML = `
        <div class="edit-box">
            <textarea class="edit-textarea" rows="3">${currentText}</textarea>
            <button type="button" class="btn-update">UPDATE</button>
        </div>
    `;

    const textarea = commentBody.querySelector('.edit-textarea');
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);

    textarea.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = `${this.scrollHeight}px`;
    });

    const updateBtn = commentBody.querySelector('.btn-update');
    updateBtn.addEventListener('click', function () {
        const updatedText = textarea.value.trim();
        if (!updatedText) return;

        handleUpdateComment(commentId, updatedText);
    });
}

function handleUpdateComment(id, newContent) {
    let target = appData.comments.find(c => c.id === id);

    if (!target) {
        for (const comment of appData.comments) {
            const foundReply = comment.replies.find(r => r.id === id);
            if (foundReply) {
                target = foundReply;
                break;
            }
        }
    }

    if (target) {
        target.content = newContent;
        renderApp();
    }
}


function handleAddReply(e) {
    e.preventDefault();
    const form = e.target;
    const targetId = Number(form.dataset.targetId);
    const replyingTo = form.dataset.replyingTo;
    let textContent = form.querySelector('textarea').value.trim();

    if (!textContent) return;

    if (replyingTo && textContent.startsWith(`@${replyingTo}`)) {
        textContent = textContent.replace(`@${replyingTo}`, '').trim();
    }

    const newReply = {
        id: Date.now(),
        content: textContent,
        createdAt: 'Just now',
        score: 0,
        replyingTo: replyingTo,
        user: appData.currentUser
    };

    let parentComment = appData.comments.find(c => c.id === targetId);

    if (!parentComment) {
        parentComment = appData.comments.find(c => c.replies.some(r => r.id === targetId));
    }

    if (parentComment) {
        parentComment.replies.push(newReply);
        renderApp();
    }
}

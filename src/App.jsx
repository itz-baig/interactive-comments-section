import {useEffect, useState} from 'react';
import initialData from './data.json';
import Card from './components/Card';
import CommentForm from './components/CommentForm';
import DeleteModal from './components/DeleteModal';

export default function App(){
    const [data, setData] = useState(() => {
        const localData =localStorage.getItem('comment_app');
        return localData ? JSON.parse(localData) : initialData;
    });

    const [showModal, setShowModal] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);

    function handleAddReply(parentId, text, replyingTo) {
      
      const newReply = {
        id: Date.now(),
        content: text,
        createdAt: 'now',
        score: 0,
        replyingTo: replyingTo,
        user: {
          image: {
            png: data.currentUser.image.png,
            webp: data.currentUser.image.webp
          },
          username: data.currentUser.username
        }
      }
      
      setData((prevData) => ({
        ...prevData,
        comments: prevData.comments.map((comment) => {
          const isTargetComment = comment.id === parentId;
          const isTargetReply = comment.replies?.some(r => r.id === parentId);

          if (isTargetComment || isTargetReply) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            };
          }
          return comment;
        })
      }))
    }

    function handleAddComment(text){
      const newComment = {
        id: Date.now(),
        content: text,
        createdAt: 'now',
        score: 0,
        user: data.currentUser,
        replies: []
      };
      setData((prevData) => ({
        ...prevData,
        comments: [...prevData.comments, newComment]
      }));
    }

    function handleUpdateComment(targetId, newContent) {
      const updateTree = (list) =>
        list.map((item) => {
          if (item.id === targetId) {
            return { ...item, content: newContent };
          }
          if (item.replies && item.replies.length > 0) {
            return { ...item, replies: updateTree(item.replies) };
          }
          return item;
        });
      setData((prevData) => ({
        ...prevData,
        comments: updateTree(prevData.comments)
      }));
    }

    function handleOpenModal(commentId) {
      setShowModal(true);
      setCommentToDelete(commentId);
    }

    function handleCancelModal(){
      setShowModal(false)
      setCommentToDelete(null)
    }

    function handleConfirmDelete() {
        if (commentToDelete === null) return;

        setData((prevData) => ({
            ...prevData,
            comments: deleteCommentFromTree(prevData.comments, commentToDelete)
        }));
        setShowModal(false);
        setCommentToDelete(null);
    }

    function handleScoreChange(targetId, delta) {
    const updateTree = (list) =>
      list.map((item) => {
        if (item.id === targetId) {
          return { ...item, score: Math.max(0, item.score + delta) };
        }
        if (item.replies && item.replies.length > 0) {
          return { ...item, replies: updateTree(item.replies) };
        }
        return item;
      });

    setData((prevData) => ({
      ...prevData,
      comments: updateTree(prevData.comments)
    }));
}

    
    function deleteCommentFromTree(comments, idToDelete) {
        return comments
        .filter((comment) => comment.id !== idToDelete)
        .map((comment) => ({
            ...comment,
            replies: comment.replies
            ? comment.replies.filter((reply) => reply.id !== idToDelete)
            : []
        }));
    }

    useEffect(() => {
        localStorage.setItem('comment_app', JSON.stringify(data));
    }, [data]);
    return (
      <>
        <main className="comments-list">
          {data.comments.map((comment) => (
            <Card 
                key={comment.id} 
                comment={comment} 
                currentUser={data.currentUser}
                onDelete={handleOpenModal}
                onUpdate={handleUpdateComment}
                onReply={handleAddReply}
                onScoreChange={handleScoreChange}
            />
          ))}
          <CommentForm 
            currentUser={data.currentUser}
            onSubmit={handleAddComment}
            buttonText='Send'
            />
        </main>
        
        <DeleteModal 
            isOpen={showModal}
            onCancel={handleCancelModal}
            onConfirm={handleConfirmDelete}
        />
      </>
    )
}
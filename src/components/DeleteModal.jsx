import { createPortal } from 'react-dom';

export default function DeleteModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" id="delete-modal">
      <div className="modal-card">
        <h3 className="modal-title">Delete comment</h3>
        <p className="modal-text">
          Are you sure you want to delete this comment? This will remove the comment and can't be undone.
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            NO, CANCEL
          </button>
          <button type="button" className="btn-delete-confirm" onClick={onConfirm}>
            YES, DELETE
          </button>
        </div>
      </div>
    </div>,
    document.body 
  );
}

import React, { useState } from 'react';

function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onUpdate(todo.id, { title: editTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {!isEditing ? (
        <>
          <input
            type="checkbox"
            checked={todo.completed === 1}
            onChange={() => onToggle(todo.id, todo.completed)}
          />
          <span>{todo.title}</span>
          <div className="todo-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit
            </button>
            <button onClick={() => onDelete(todo.id)} className="delete-btn">
              Delete
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            autoFocus
          />
          <div className="edit-actions">
            <button type="submit" className="save-btn">Save</button>
            <button type="button" onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </form>
      )}
    </li>
  );
}

export default TodoItem;
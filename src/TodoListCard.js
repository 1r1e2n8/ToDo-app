import React, { useState } from 'react';

function TodoListCard({ list, onUpdateListName, onAddTodo, onToggleTodo, onDeleteTodo }) {
  const [newTodoText, setNewTodoText] = useState('');
  const [listName, setListName] = useState(list.name);

  const handleAddTodo = () => {
    if (newTodoText.trim() !== '') {
      onAddTodo(list.id, newTodoText);
      setNewTodoText('');
    }
  };

  const handleNameBlur = () => {
    onUpdateListName(list.id, listName);
  };

  return (
    <div className="todo-list-card card">
      <div className="card-header">
        <input
          type="text"
          className="form-control list-name-input"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          onBlur={handleNameBlur}
          placeholder="List Name"
        />
      </div>
      <div className="card-body">
        <div className="input-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Add a new task"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
          />
          <button className="btn btn-primary btn-sm" type="button" onClick={handleAddTodo}>Add</button>
        </div>
        <ul className="list-group list-group-flush">
          {list.todos.map(todo => (
            <li key={todo.id} className={`list-group-item d-flex justify-content-between align-items-center ${todo.completed ? 'completed' : ''}`}>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => onToggleTodo(list.id, todo.id)}
                />
                <label className="form-check-label">
                  {todo.text}
                </label>
              </div>
              <div className="d-flex align-items-center">
                {todo.completedAt && (
                  <small className="text-muted me-3">
                    Completed: {new Date(todo.completedAt).toLocaleString()}
                  </small>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => onDeleteTodo(list.id, todo.id)}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TodoListCard;
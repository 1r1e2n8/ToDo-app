import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import TodoListCard from './TodoListCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

function App() {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    // Listen for full updates from the server
    socket.on('lists_updated', (allLists) => {
      setLists(allLists);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('lists_updated');
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleUpdateListName = (listId, newName) => {
    socket.emit('update_list_name', { listId, newName });
  };

  const handleAddTodo = (listId, text) => {
    socket.emit('add_todo', { listId, text });
  };

  const handleToggleTodo = (listId, todoId) => {
    socket.emit('toggle_todo', { listId, todoId });
  };

  const handleDeleteTodo = (listId, todoId) => {
    socket.emit('delete_todo', { listId, todoId });
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="text-center mb-4">本日のタスク</h1>
      <div className="todo-board">
        {lists.map(list => (
          <TodoListCard
            key={list.id}
            list={list}
            onUpdateListName={handleUpdateListName}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
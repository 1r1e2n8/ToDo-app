
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import TodoListCard from './TodoListCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const LIST_COUNT = 20;

// Establish a single socket connection for the app
const socket = io(API_URL);

// Helper to create initial state
const createInitialLists = () => {
  return Array.from({ length: LIST_COUNT }, (_, i) => ({
    id: `list-${i}`,
    name: `List ${i + 1}`,
    todos: [],
  }));
};

function App() {
  const [lists, setLists] = useState(createInitialLists());

  useEffect(() => {
    // Listen for updates from the server
    socket.on('todos_updated', (allTodos) => {
      const updatedLists = createInitialLists();
      allTodos.forEach(todo => {
        const list = updatedLists.find(l => l.id === todo.user);
        if (list) {
          list.todos.push(todo);
        }
      });
      setLists(updatedLists);
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.off('todos_updated');
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleAddTodo = (listId, text) => {
    socket.emit('add_todo', { text, user: listId });
  };

  const handleToggleTodo = (listId, todoId) => {
    // The listId is not strictly needed by the backend now, but we keep it for consistency
    socket.emit('toggle_todo', todoId);
  };

  const handleDeleteTodo = (listId, todoId) => {
    // The listId is not strictly needed by the backend now, but we keep it for consistency
    socket.emit('delete_todo', todoId);
  };

  // This function is now local-only and doesn't need to interact with the backend
  const handleUpdateListName = (listId, newName) => {
    const updatedLists = lists.map(list =>
      list.id === listId ? { ...list, name: newName } : list
    );
    setLists(updatedLists);
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="text-center mb-4">Real-Time Multi-List TODO Board</h1>
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

import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import TodoListCard from './TodoListCard';

const API_URL = 'http://localhost:5000/api/todos';
const LIST_COUNT = 20;

// Helper to create initial state
const createInitialLists = () => {
  return Array.from({ length: LIST_COUNT }, (_, i) => ({
    id: `list-${i}`,
    name: ``, // Initial name is empty
    todos: [],
  }));
};

function App() {
  const [lists, setLists] = useState(createInitialLists());

  // Fetch all todos for all lists on initial load
  useEffect(() => {
    const fetchAllTodos = async () => {
      const allLists = createInitialLists();
      for (let i = 0; i < LIST_COUNT; i++) {
        try {
          const response = await fetch(`${API_URL}?user=list-${i}`);
          const todos = await response.json();
          allLists[i].todos = todos;
        } catch (error) {
          console.error(`Error fetching todos for list-${i}:`, error);
        }
      }
      setLists(allLists);
    };
    fetchAllTodos();
  }, []);

  const handleUpdateListName = (listId, newName) => {
    // This is a local-only update for now, as we don't have a backend endpoint for it.
    const updatedLists = lists.map(list => 
      list.id === listId ? { ...list, name: newName } : list
    );
    setLists(updatedLists);
  };

  const handleAddTodo = (listId, text) => {
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user: listId }),
    })
      .then(res => res.json())
      .then(newTodo => {
        const updatedLists = lists.map(list =>
          list.id === listId ? { ...list, todos: [...list.todos, newTodo] } : list
        );
        setLists(updatedLists);
      })
      .catch(error => console.error('Error adding todo:', error));
  };

  const handleToggleTodo = (listId, todoId) => {
    fetch(`${API_URL}/${todoId}/toggle`, { method: 'PUT' })
      .then(res => res.json())
      .then(updatedTodo => {
        const updatedLists = lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              todos: list.todos.map(t => t.id === todoId ? updatedTodo : t),
            };
          }
          return list;
        });
        setLists(updatedLists);
      })
      .catch(error => console.error('Error toggling todo:', error));
  };

  const handleDeleteTodo = (listId, todoId) => {
    fetch(`${API_URL}/${todoId}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          const updatedLists = lists.map(list => {
            if (list.id === listId) {
              return { ...list, todos: list.todos.filter(t => t.id !== todoId) };
            }
            return list;
          });
          setLists(updatedLists);
        } else {
          throw new Error('Failed to delete todo');
        }
      })
      .catch(error => console.error('Error deleting todo:', error));
  };

  return (
    <div className="container-fluid mt-4">
      <h1 className="text-center mb-4">Multi-List TODO Board</h1>
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

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;
const DB_FILE = './db.json';
const LIST_COUNT = 20;

// --- Database Functions ---
const initializeDB = () => {
  const initialLists = Array.from({ length: LIST_COUNT }, (_, i) => ({
    id: `list-${i}`,
    name: `List ${i + 1}`,
    todos: [],
  }));
  fs.writeFileSync(DB_FILE, JSON.stringify({ lists: initialLists }, null, 2));
  return initialLists;
};

const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = initializeDB();
    return { lists: initialData };
  }
  try {
    const data = fs.readFileSync(DB_FILE);
    const db = JSON.parse(data);
    // Basic validation
    if (Array.isArray(db.lists)) {
      return db;
    }
  } catch (error) {
    console.error("Error reading or parsing DB_FILE:", error);
  }
  // If file is corrupt or invalid, re-initialize
  const reinitializedData = initializeDB();
  return { lists: reinitializedData };
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Real-time Logic ---
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Send all current lists to the newly connected client
  const db = readDB();
  socket.emit('lists_updated', db.lists);

  // Listen for a list name update
  socket.on('update_list_name', ({ listId, newName }) => {
    const db = readDB();
    const list = db.lists.find(l => l.id === listId);
    if (list) {
      list.name = newName;
      writeDB(db);
      io.emit('lists_updated', db.lists);
    }
  });

  // Listen for a new todo
  socket.on('add_todo', ({ listId, text }) => {
    const db = readDB();
    const list = db.lists.find(l => l.id === listId);
    if (list) {
      const newTodo = {
        id: Date.now(),
        text,
        completed: false,
        completedAt: null,
      };
      list.todos.push(newTodo);
      writeDB(db);
      io.emit('lists_updated', db.lists);
    }
  });

  // Listen for a todo toggle
  socket.on('toggle_todo', ({ listId, todoId }) => {
    const db = readDB();
    const list = db.lists.find(l => l.id === listId);
    if (list) {
      const todo = list.todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        writeDB(db);
        io.emit('lists_updated', db.lists);
      }
    }
  });

  // Listen for a todo deletion
  socket.on('delete_todo', ({ listId, todoId }) => {
    const db = readDB();
    const list = db.lists.find(l => l.id === listId);
    if (list) {
      list.todos = list.todos.filter(t => t.id !== todoId);
      writeDB(db);
      io.emit('lists_updated', db.lists);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

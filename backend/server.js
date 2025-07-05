const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

app.use(cors());

const DB_FILE = './db.json';

// --- Database Functions ---
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ todos: [] }));
  }
  const data = fs.readFileSync(DB_FILE);
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// --- Real-time Logic ---
io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Send all current todos to the newly connected client
  const db = readDB();
  socket.emit('todos_updated', db.todos);

  // Listen for a new todo from a client
  socket.on('add_todo', (newTodoData) => {
    const db = readDB();
    const newTodo = {
      id: Date.now(),
      text: newTodoData.text,
      user: newTodoData.user,
      completed: false,
      completedAt: null,
    };
    db.todos.push(newTodo);
    writeDB(db);

    // Broadcast the updated list to all clients
    io.emit('todos_updated', db.todos);
  });

  // Listen for a todo toggle
  socket.on('toggle_todo', (todoId) => {
    const db = readDB();
    const todo = db.todos.find(t => t.id === todoId);
    if (todo) {
      todo.completed = !todo.completed;
      todo.completedAt = todo.completed ? new Date().toISOString() : null;
      writeDB(db);
      io.emit('todos_updated', db.todos);
    }
  });

  // Listen for a todo deletion
  socket.on('delete_todo', (todoId) => {
    const db = readDB();
    db.todos = db.todos.filter(t => t.id !== todoId);
    writeDB(db);
    io.emit('todos_updated', db.todos);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
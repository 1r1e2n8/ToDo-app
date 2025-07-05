
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const DB_FILE = './db.json';

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

// Get todos for a specific user
app.get('/api/todos', (req, res) => {
  const { user } = req.query;
  if (!user) {
    return res.status(400).send('User query parameter is required');
  }
  const db = readDB();
  const userTodos = db.todos.filter(todo => todo.user === user);
  res.json(userTodos);
});

// Add a new todo for a specific user
app.post('/api/todos', (req, res) => {
  const { text, user } = req.body;
  if (!text || !user) {
    return res.status(400).send('Text and user are required');
  }
  const db = readDB();
  const newTodo = {
    id: Date.now(),
    text,
    user,
    completed: false,
    completedAt: null,
  };
  db.todos.push(newTodo);
  writeDB(db);
  res.status(201).json(newTodo);
});

// Toggle a todo's completion status
app.put('/api/todos/:id/toggle', (req, res) => {
  const db = readDB();
  const todoId = parseInt(req.params.id, 10);
  const todo = db.todos.find(t => t.id === todoId);

  if (todo) {
    todo.completed = !todo.completed;
    todo.completedAt = todo.completed ? new Date().toISOString() : null;
    writeDB(db);
    res.json(todo);
  } else {
    res.status(404).send('Todo not found');
  }
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
  const db = readDB();
  const todoId = parseInt(req.params.id, 10);
  db.todos = db.todos.filter(todo => todo.id !== todoId);
  writeDB(db);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

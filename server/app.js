require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET; // In production, use environment variable

// Enable CORS in development and production with restrictions
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  
  // Serve the React index.html for any non-API request
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
else{
  // Allow all origin
  app.use(cors());
}

app.use(express.json());

// Database setup
let db;

async function initializeDatabase() {
  db = await open({
    filename: path.join(__dirname, 'todos.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);
}

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

app.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if user exists
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await db.run(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    
    res.status(201).json({ id: result.lastID, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Create and assign token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Todo Routes
app.get('/todos', authenticateToken, async (req, res) => {
  try {
    const todos = await db.all('SELECT * FROM todos WHERE user_id = ?', [req.user.id]);
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/todos', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const result = await db.run(
      'INSERT INTO todos (title, user_id) VALUES (?, ?)',
      [title, req.user.id]
    );
    
    const newTodo = await db.get('SELECT * FROM todos WHERE id = ?', [result.lastID]);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    // Check if todo exists and belongs to user
    const todo = await db.get(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized' });
    }
    
    let updateQuery = 'UPDATE todos SET ';
    const params = [];
    
    if (title !== undefined) {
      updateQuery += 'title = ?, ';
      params.push(title);
    }
    
    if (completed !== undefined) {
      updateQuery += 'completed = ?, ';
      params.push(completed ? 1 : 0);
    }
    
    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE id = ? AND user_id = ?';
    params.push(id, req.user.id);
    
    await db.run(updateQuery, params);
    
    const updatedTodo = await db.get('SELECT * FROM todos WHERE id = ?', [id]);
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/todos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if todo exists and belongs to user
    const todo = await db.get(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found or unauthorized' });
    }
    
    await db.run('DELETE FROM todos WHERE id = ?', [id]);
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
  });

module.exports = app;
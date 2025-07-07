const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Connect to SQLite DB
const db = new sqlite3.Database('./tasks.db', (err) => {
    if (err) return console.error(err.message);
    console.log('Connected to the tasks database.');
});

// Create tasks table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Routes

// Get all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { description } = req.body;
    db.run('INSERT INTO tasks (description) VALUES (?)', [description], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, description });
    });
});

// Edit a task
app.put('/tasks/:id', (req, res) => {
    const { description } = req.body;
    db.run('UPDATE tasks SET description = ? WHERE id = ?', [description, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });
});


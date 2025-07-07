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

// Edit a task (can update description and/or completed status)
app.put('/tasks/:id', (req, res) => {
    const { description, completed } = req.body;
    const id = req.params.id;
    console.log(`PUT /tasks/${id} - Received: description='${description}', completed='${completed}'`); // Debugging log

    let updateFields = [];
    let params = [];

    if (description !== undefined) {
        updateFields.push('description = ?');
        params.push(description);
    }
    if (completed !== undefined) {
        updateFields.push('completed = ?');
        params.push(completed);
    }

    if (updateFields.length === 0) {
        console.log('PUT /tasks/:id - No fields to update provided.'); // Debugging log
        return res.status(400).json({ error: 'No fields to update provided.' });
    }

    params.push(id); // Add id for WHERE clause

    const sql = `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`;
    console.log(`PUT /tasks/:id - Executing SQL: ${sql} with params: ${params}`); // Debugging log

    db.run(sql, params, function (err) {
        if (err) {
            console.error('PUT /tasks/:id - Database error:', err.message); // Debugging log
            return res.status(500).json({ error: err.message });
        }
        console.log(`PUT /tasks/:id - Task ${id} updated. Changes: ${this.changes}`); // Debugging log
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
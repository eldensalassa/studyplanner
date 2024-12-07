const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Enable CORS
app.use(cors());
app.use(express.json()); // Pastikan body parser aktif

// Menyajikan file statis dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Inisialisasi database SQLite
const db = new sqlite3.Database('./studyplanner.db');

// Endpoint untuk mengambil daftar task (GET)
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Kirim data task sebagai response
    });
});

// Endpoint untuk mengambil satu task berdasarkan ID (GET)
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(row); // Kirim task berdasarkan ID sebagai response
    });
});

// Endpoint untuk menambah task baru (POST)
app.post('/tasks', (req, res) => {
    const { text, dueDate, priority, category, reminderTime, progress, notes } = req.body;

    const sql = `INSERT INTO tasks (text, dueDate, priority, category, reminderTime, progress, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [text, dueDate, priority, category, reminderTime, progress, notes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            id: this.lastID, // ID dari task yang baru ditambahkan
            text,
            dueDate,
            priority,
            category,
            reminderTime,
            progress,
            notes
        });
    });
});

// Endpoint untuk mengupdate task berdasarkan ID (PUT)
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { text, dueDate, priority, category, reminderTime, progress, notes } = req.body;

    const sql = `UPDATE tasks SET text = ?, dueDate = ?, priority = ?, category = ?, reminderTime = ?, progress = ?, notes = ?
                 WHERE id = ?`;

    db.run(sql, [text, dueDate, priority, category, reminderTime, progress, notes, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({
            id,
            text,
            dueDate,
            priority,
            category,
            reminderTime,
            progress,
            notes
        });
    });
});

// Endpoint untuk menghapus task berdasarkan ID (DELETE)
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM tasks WHERE id = ?";
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json({ message: 'Task deleted successfully' });
    });
});

// Menyajikan file index.html saat mengakses root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jalankan server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

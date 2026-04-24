const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ডাটাবেস কানেকশন
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "event_management" // আপনার ডাটাবেসের নাম যদি অন্য কিছু হয়, তবে এখানে বদলে দেবেন
});

db.connect(err => {
    if (err) {
        console.log("Database Connection Error: ", err);
    } else {
        console.log("Connected to MySQL Database successfully!");
    }
});

// ১. Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length > 0) {
            res.json({ message: "লগইন সফল হয়েছে!", user: result[0] });
        } else {
            res.status(401).json({ message: "ভুল ইমেইল বা পাসওয়ার্ড!" });
        }
    });
});

// ২. Register API
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, password], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!" });
    });
});

// ৩. নির্দিষ্ট ইউজারের ইভেন্ট দেখার API
app.get('/api/events/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = "SELECT * FROM events WHERE user_id = ?";
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ৪. নতুন ইভেন্ট যোগ করার API
app.post('/api/events', (req, res) => {
    const { title, description, event_date, user_id } = req.body;
    const sql = "INSERT INTO events (title, description, event_date, user_id) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, description, event_date, user_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "ইভেন্ট সফলভাবে যুক্ত হয়েছে!" });
    });
});

// ৫. ইভেন্ট আপডেট করার API
app.put('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { title, description, event_date } = req.body;
    const sql = "UPDATE events SET title = ?, description = ?, event_date = ? WHERE id = ?";
    db.query(sql, [title, description, event_date, eventId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "ইভেন্ট সফলভাবে আপডেট হয়েছে!" });
    });
});

// ৬. ইভেন্ট ডিলিট করার API
app.delete('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const sql = "DELETE FROM events WHERE id = ?";
    db.query(sql, [eventId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "ইভেন্ট ডিলিট করা হয়েছে!" });
    });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
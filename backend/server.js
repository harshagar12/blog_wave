require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:5500'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306  // Use the environment variable or default to 3306
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ error: 'Access Denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ error: 'Invalid Token' });
    }
};

// User registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const [existingUser] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
            [username, email, hashedPassword], 
            (err, result) => {
                if (err) {
                    console.error('Registration error:', err);
                    return res.status(500).json({ error: 'Registration failed' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Find user by email
        const [user] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Create a post with image upload
app.post('/posts', verifyToken, upload.single('featured-image'), (req, res) => {
    const { title, content, category } = req.body;
    const user_id = req.user.id;
    let imageUrl = '';

    if (req.file) {
        imageUrl = `uploads/${req.file.filename}`;
    }

    if (!title || !content || !category) {
        return res.status(400).json({ error: 'All fields (title, content, category) are required' });
    }

    db.query('INSERT INTO posts (title, content, category, user_id, image_url) VALUES (?, ?, ?, ?, ?)', 
        [title, content, category, user_id, imageUrl], 
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to create post' });
            }
            res.status(201).json({ message: 'Post created successfully' });
        }
    );
});

// Get posts by category
app.get('/posts', (req, res) => {
    const category = req.query.category;

    let query = 'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id';
    let queryParams = [];

    if (category) {
        query += ' WHERE posts.category = ?';
        queryParams.push(category);
    }

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
        }
        console.log('Fetched posts:', results); // Add this line
        res.status(200).json(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
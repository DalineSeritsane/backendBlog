const express = require("express");
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router(); 

const usersFilePath = path.join(__dirname, '../data/users.json'); // Path for users data storage

// Helper function to read users from the file
const readUser = () => {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    }
    return [];
};

// Register new user
router.post('/register', (req, res) => {
    const { username, password, email } = req.body;
    console.log("Received data:", req.body);
    
    const users = readUser(); // Read existing users from the file

    // Check if the user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash the password and create new user
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = { id: users.length + 1, username, email, password: hashedPassword };
    users.push(newUser);

    try {
        // Save the updated users array to file
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log("Error saving user:", error);
        res.status(500).json({ message: 'Error saving user. Try again' });
    }
});

// Login user
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt:", req.body);

    const users = readUser(); // Use readUser() to get users data

    // Find the user with matching username
    const user = users.find(user => user.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token and send success response if credentials are correct
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ auth: true, token, message: 'Login successful' });
});

// Logout user 
router.post('/logout', (req, res) => {
    res.json({ auth: false, token: null });
});

module.exports = router;

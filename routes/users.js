const express = require("express");
const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const router = express.Router(); 

const usersFilePath = path.join(__dirname, '../data/users.json'); //creating path data for frontend data to be storaged in user.json

const readUser = () => {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
};

//Register for users
router.post('/register', (req, res) => {
    const {username, password, email } = req.body;
    console.log("Received data:", req.body);
    const users = readUser(); //read our users from the files

    const existingUser = users.find(user.username === username);
    if (existingUser) return res.status(400).json({message: 'User already exists'}); //If user already exists then show message

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = {id: users.length + 1, username, email, password:hashedPassword };
    users.push(newUser); //to hash our password 

    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        res.status(201).json({message: 'User registered successfully'});

    }catch (error) {
        console.log("Error saving user:", error);
        res.status(500).json({message: 'Error cant save user. Try again'});
    }

});

//Login user
router.post("/login", (req, res) => {
    const {username, password } = req.body;
    console.log("Login attempt:", req.body);

    const users = readUsers();

    const user = user.find(user => user.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({message: 'Invalid credentials'});
    } //Falso user trying to login

    //If credentials are correct, send a success response
    const token = jwt.sign({ id: user.id }, '4204', {expiresIn: '24'});
    res.json({auth: true, token, message: 'Login successful' });
});

//Logout user 
router.post('/logout', (req, res) => {
    res.json({ auth: false, token: null });
});

module.exports = router;
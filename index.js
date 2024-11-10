require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/users');
const blogsRoutes = require('./routes/blogs');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

//serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//define routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogsRoutes);

app.listen(PORT, () =>{
    console.log(`Server is running on http://localhost:${PORT}`);
});
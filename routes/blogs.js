const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 1000000 } }); // limit 1MB

const blogFilePath = path.join(__dirname, '../data/blogs.json');

// Helper function to read blogs from file
const readBlogs = () => {
    if (fs.existsSync(blogFilePath)) {
        const data = fs.readFileSync(blogFilePath);
        return JSON.parse(data);
    }
    return [];
};

// Helper function to write blogs to file
const writeBlogs = (blogs) => {
    fs.writeFileSync(blogFilePath, JSON.stringify(blogs, null, 2));
};

// Route to create a new blog post
router.post('/', upload.single('image'), (req, res) => {
    const { title, author, shortDescription, content } = req.body;
    const imageName = req.file ? req.file.filename : '';
    const blogs = readBlogs();

    const newBlog = {
        id: blogs.length + 1,
        title,
        content,
        shortDescription,
        image: imageName,
        author: req.user ? req.user.id : author,
        date: new Date().toISOString(),
        comments: []
    };

    blogs.push(newBlog);
    writeBlogs(blogs);

    res.status(201).json({
        message: 'Blog post created successfully',
        blog: newBlog
    });
});

// Route to get all blogs
router.get("/", (req, res) => {
    const blogs = readBlogs();
    res.json(blogs);
});

// Route to find a blog post by ID
router.get('/:id', (req, res) => {
    const blogs = readBlogs();
    const post = blogs.find(b => b.id === parseInt(req.params.id));

    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

// Route to add a comment to a blog post
router.post('/:id/comments', (req, res) => {
    const { username, comment } = req.body;
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id == req.params.id);

    if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
    }

    const newComment = {
        id: blog.comments.length + 1,
        username,
        comment,
        replies: []
    };

    blog.comments.push(newComment);
    writeBlogs(blogs);

    res.status(201).json(newComment);
});

// Route to reply to a comment on a blog post
router.post('/:id/comments/:commentId/reply', (req, res) => {
    const { username, reply } = req.body;
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id == req.params.id);

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = blog.comments.find(c => c.id == req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const newReply = {
        id: comment.replies.length + 1,
        username,
        reply
    };

    comment.replies.push(newReply);
    writeBlogs(blogs);

    res.status(201).json(newReply);
});

// Route to delete a comment from a blog post
router.delete('/:id/comments/:commentId', (req, res) => {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id == req.params.id);

    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const commentIndex = blog.comments.findIndex(c => c.id == req.params.commentId);
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });

    blog.comments.splice(commentIndex, 1);
    writeBlogs(blogs);

    res.status(204).send();
});

// Route to delete a blog post by ID
router.delete('/:id/posts', (req, res) => {
    const blogs = readBlogs();
    const postId = parseInt(req.params.id);
    const postIndex = blogs.findIndex(p => p.id === postId);

    if (postIndex !== -1) {
        const [deletedPost] = blogs.splice(postIndex, 1);
        writeBlogs(blogs);

        res.json(deletedPost);
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

module.exports = router;

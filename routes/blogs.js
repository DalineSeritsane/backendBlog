const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { title } = require('process');
const router = express.Router();

const upload = multer({dest:'uploads/'}); //dest of uploads for images

const blogFilePath = path.join(__dirname, '../data/blogs.json');

//To read the blogs function from file
const readBlogs = () => {
    const data = fs.readFileSync(blogFilePath);
    return JSON.parse(data);
} 


//Get all blogs
router.get("/", (req, res) => {
    const blogs = readBlogs();
    res.json(blogs);
});

//Find post by ID

router.get('/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = blogPosts.find((p) => p.id === postId);

    if (post) {
       
        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        console.log(`Blog post with ID ${postId} has been updated.`);
        res.json(post); 
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});


// Route to fetch all blog posts
// router.get("/api/posts", (req, res) => {
//     console.log("GET request to fetch all blog posts");
//     res.json(blogPosts);
// }); 

// Route to fetch a single blog post by its ID
router.get('/:id', (req, res) => {
    const blogs = readBlogs();
    const post = blogs.find(b => b.id === parseInt(req.params.id));
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

//Creating a blog post
router.post('/', upload.single('image'), (req, res) => {
    const { title, author, date, shortDescription, image, content } = req.body;
    const imageName = req.file ? req.file.filename : ''; //for file's name thats uploaded
   
   
   try{
    const blogs = readBlogs();
    const newBlog = {
        id: blogs.length + 1,
        title,
        content,
        shortDescription,
        image: imageName,
        author: req.user ? req.user.id : author,
        date: new Date().toDateString(),
        comments: []
    };
    blogs.push(newBlog);
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
    res.status(201).json({message: 'Blog post created successfully', blog: newBlog });
   } catch (error) {
    console.error('Error reating blog:', error);
    res.status(500).json({message: 'Error creating blog'});

   }
});

//set storage engine
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, file.filename + '_' + Date.now() + path.extname(file.originalname));
    }
});

// Initializing upload of images
const uploads = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // limited size 1MB

}).single('image');

try{

    const newBlog = {
        id: blogs.length + 1,
        title,
        content,
        shortDescription,
        image: imageName,
        author: req.user ? req.user.id : author, //authenticated author
        date: new Date().toISOString(), 
        comments: []
    };

    blogs.push(newBlog); 

    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));

    res.status(201).json({
        message: 'Blog post created successfully',
        blog: newBlog,
    });
} catch (error) {
    console.log('Error creating blog:', error);
    res.status(500).json({message: 'Error creating blog'});
};

// POST route to add a new blog post
// router.post("/api/posts", (req, res) => {
//     console.log(req.body)
//     const newPost = {
//          id: blogPosts.length + 1, 
//         title: req.body.title,
//         content: req.body.content,
//          comments: [] 
//     };
    
//      blogPosts.push(newPost); 
//     console.log("New blog post created:", newPost);
//     res.status(201).json(newPost); 
// });

//ROute to comment on a blog post
router.post('/:id/comments', (req, res) => {
    try{
        const { username, comment } = req.body;
        const blogs = readBlogs();
        const blog = blogs.find(b => b.id == req.params.id);

        if (!blog) {return res.status(404).json({
            message: 'Blog can not be found' });
        }
        const newComment = {
            id: blog.comments.length + 1,
            username,
            comment,
            replies: []
        };

        if (!blog.comments) {
            blog.comments = [];
        }

        blog.comments.push(newComment);

        fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error invaild comment added:', error);
        res.status(500).json({message: 'Error invaild comment added', error: error.message });
    }
});

//Reply to a comment
router.post('/:id/comments/:commentId/reply', (req, res) => {
    const { username, reply} = req.body;
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id == req.params.id);

    if (!blog) return res.status(404).json({message: 'Blog not found'});

    const comment = blog.comments.find( c => c.id == req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found'});

    const newReply = {
        id: comment.replies.length + 1,
        username,
        reply
    };
    comment.replies.push(newReply);

    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
    res.status(201).json(newReply);
});

// Delete a comment
router.delete('/:id/comments/:commentId', (req, res) => {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id == req.params.id);
    
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    
    const commentIndex = blog.comments.findIndex(c => c.id == req.params.commentId);
    if (commentIndex === -1) return res.status(404).json({ message: 'Comment not found' });
    
    blog.comments.splice(commentIndex, 1);
    
    fs.writeFileSync(blogsFilePath, JSON.stringify(blogs, null, 2));
    res.status(204).send();
  });
  
  //Blog posts to be delted
router.delete('/:id/posts', (req, res) => {
    const blogs = readBlogs();  //Read blogs from file
    const postId = parseInt(req.params.id);
    const postIndex = blogs.findIndex((p) => p.id === postId);  // Find index of the post by ID

    if (postIndex !== -1) {
        const deletedPost = blogs.splice(postIndex, 1);  // Remove post from array
        try {
            fs.writeFileSync(blogFilePath, JSON.stringify(blogs, null, 2));  // Write updated blogs back to file
            console.log(`Blog post with ID ${postId} has been deleted.`);
            res.json(deletedPost[0]);  // Return deleted post as response
        } catch (error) {
            console.error('Error deleting blog post:', error);
            res.status(500).json({ message: 'Error deleting blog post' });
        }
    } else {
        res.status(404).json({ message: "Post not found" });
    }
});

module.exports = router;
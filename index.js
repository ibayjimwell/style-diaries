const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs'); // Set the view engine to ejs it's help to render the html file and make it reusable
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.static(path.join(__dirname, 'static'))) // Serve static files from the public directory

// Global variables
const User = {
    username: 'JohnDoe', // Example user data
    password: 'password123' // Example password data
};

// Middlewares
app.use((req, res, next) => {
    res.locals.currentPath = req.path; // make available in all EJS files
    next();
});

// Initial route
app.get('/', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('index');
    }
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Fashions route
app.get('/fashions', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('fashions');
    }
});

// User profile route
app.get('/user/profile', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('profile');
    }
});

// Cart route
app.get('/shop/Cart', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('cart');
    }
});

// Shop route
app.get('/shop/:category', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('shop', { category: req.params.category });
    }
});

// This is where the server is listening for incoming requests
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = app; // Export the app to detect in deploying
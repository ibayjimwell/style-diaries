const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs'); // Set the view engine to ejs it's help to render the html file and make it reusable
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.use(express.static(path.join(__dirname, 'static'))) // Serve static files from the public directory
let database = require('./database.js'); // Import the database class
const { Query } = require('pg');
let db = new database(); // Create an instance of the database class or connect to the database

// Global variables
let User = null;
let Search = null;

// Middlewares
app.use((req, res, next) => {
    res.locals.currentPath = req.path; // make available in all EJS files
    next();
});
// For JSON requests
app.use(express.json());
// For form data (from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Initial route
app.get('/', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let fashions = await db.getFashions(12);
        res.render('index', { fashions: fashions });
    }
});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let login = await db.loginUser(username, password); // Call the login method from the database class

    if (login) {
        User = login; // Set the global User variable to the logged-in user
        res.redirect('/'); // Redirect to the home page after successful login
    } else {
        res.render('login', { error: 'Invalid username or password.' });
    }

});

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup', { error: null });
});
app.post('/signup', async (req, res) => {
    const fullname = req.body.fullname;
    const username = req.body.username;
    const password = req.body.password;

    // Basic validation for username and password
    if (username.length >= 3 && password.length >= 8 && fullname.length >= 3) {
        let signup = await db.signupUser(username, password, fullname); // Call the signup method from the database class

        if (signup) {
            let login = await db.loginUser(username, password); // Call the login method from the database class
            if (login) {
                User = login; // Set the global User variable to the logged-in user
                res.redirect('/'); 
            }
        } else {
            res.render('signup', { error: 'Signup failed. Please try again.' });
        }
        
    } else {
        // Render the signup page with an error message
        res.render('signup', { error: 'Fullname and Username must be at least 3 characters and password at least 8 characters.' });
    }
});

// Fashions route
app.get('/fashions', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let fashions = await db.getFashions();
        res.render('fashions', { fashions: fashions });
    }
});

// User profile route
app.get('/user/profile', (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        res.render('profile', { user: User });
    }
});

// Cart route
app.get('/shop/Cart', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let cart = await db.getCartItems(User.id); // Get the user's cart from the database
        let subtotal = 0;
        let shipping = 10;
        let total = 0;

        if (cart) {
            for (let i = 0; i < cart.length; i++) {
                subtotal += parseFloat(cart[i].price); // Calculate the subtotal
            }
            total = subtotal + shipping; // Calculate the total including shipping
        }

        res.render('cart', {cart: cart, subtotal: subtotal, shipping: shipping, total: total}); // Render the cart page with the user's cart items
    }
});

// Shop route
app.get('/shop/:category', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {

        let category = req.params.category;
        let products = await db.getProducts(category); // Get products for the specified category

        res.render('shop', { user: User, category: category, products: products });
    }
});

// Add to cart route
app.post('/add/to/cart/:user_id/:category/:product_id', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let user_id = req.params.user_id;
        let category = req.params.category;
        let product_id = req.params.product_id;

        let addToCart = await db.addToCart(user_id, product_id); // Call the add to cart method from the database class

        if (addToCart) {
            if (category == 'search') {
               res.status(303).redirect(307, `/search/${Search}`); // Redirect to the search results page using POST method
            } else {
                res.redirect(`/shop/${category}/#${product_id}`);
            }
        } else {
            res.status(500).send('Error adding to cart.'); // Send an error response if adding to cart fails
        }
    }
});

// Remove from cart route
app.post('/remove/from/cart/:cart_id', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let cart_id = req.params.cart_id;
        let removeFromCart = await db.removeFromCart(cart_id); // Call the remove from cart method from the database class

        if (removeFromCart) {
            res.redirect('/shop/Cart'); // Redirect to the cart page after removing the item
        } else {
            res.status(500).send('Error removing from cart.'); // Send an error response if removing from cart fails
        }
    }
});

// Checkout route
app.post('/checkout', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        let removeAllFromCart = await db.removeAllFromCart(User.id); // Call the remove all from cart method from the database class
        if (removeAllFromCart) {
            res.redirect('/'); // Redirect to the home page after checkout
        } else {
            res.status(500).send('Error during checkout.'); // Send an error response if checkout fails
        }
    }
});

// Signout route
app.post('/signout', (req, res) => {
    User = null; // Clear the global User variable to log out the user
    res.redirect('/login'); // Redirect to the login page after signing out
});

// Search route
app.post('/search/:query', async (req, res) => {
    if (!User) {
        res.redirect('/login'); // Redirect to login page if user is not logged in
    } else {
        if (req.params.query == '0') {
           Search = req.body.search;
        } else {
            Search = req.params.query;
        }

        let products = await db.searchProducts(Search); // Call the search method from the database class

        if (products) {
            res.render('search', { products: products, user: User }); // Render the index page with the search results
        } else {
            res.status(500).send('Error searching for products.'); // Send an error response if search fails
        }
    }
});

// This is where the server is listening for incoming requests
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

module.exports = app; // Export the app to detect in hosting
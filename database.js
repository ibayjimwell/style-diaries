const pg = require('pg');
const { Pool } = pg;
require('dotenv').config(); // Load environment variables
const bcrypt = require('bcrypt'); // For password hashing

// Database class It's a responsible to manipulate the database connection and queries
class Database {
    constructor() {
        this.pool = new Pool({
            user: process.env.USER,
            host: process.env.HOST,
            database: process.env.DATABASE,
            password: process.env.PASSWORD,
            port: process.env.PORT,
        });
    }

    // Method to get the fashions ramdomly
    async getFashions(limit = null) {
        try {
            
            if (limit) {
                const result = await this.pool.query('SELECT * FROM style_diaries_fashions ORDER BY RANDOM() LIMIT $1', [limit]);
                return result.rows;
            } else {
                const result = await this.pool.query('SELECT * FROM style_diaries_fashions ORDER BY RANDOM()');
                return result.rows;
            }

        } catch (error) {
            console.error('Error in getFashions:', error);
        }
    }

    // Method to Signup a user
    async signupUser(username, password, fullname) {
        try {
            const saltRound = 10;
            const hashedPassword = await bcrypt.hash(password, saltRound); // Hash the password
            const result = await this.pool.query('INSERT INTO style_diaries_users (username, password, fullname) VALUES ($1, $2, $3)', [username, hashedPassword, fullname]);

            if (result.rowCount > 0) {
                return true; // User successfully signed up
            } else {
                return false; // User signup failed
            }

        } catch (error) {
            console.error('Error in signupUser:', error);
        }
    }

    // Method to login a user
    async loginUser(username, password) {
        try {
            const result = await this.pool.query('SELECT * FROM style_diaries_users WHERE username = $1', [username]);
            if (result.rows.length > 0) {
                const user = result.rows[0];
                const isMatch = await bcrypt.compare(password, user.password); // Compare the hashed password
                if (isMatch) {
                    return user; // Return the user object if login is successful
                } else {
                    return false; // Password does not match
                }
            } else {
                return false; // User not found
            }
        } catch (error) {
            console.error('Error in loginUser:', error);
            return false;
        }
    }

    // Method to get a products
    async getProducts(category) {
        try {
            const result = await this.pool.query('SELECT * FROM style_diaries_products WHERE category = $1', [category]);
            return result.rows; // Return the products for the specified category
        } catch (error) {
            console.error('Error in getProducts:', error);
        }
    }

    // Method to add to cart
    async addToCart(userId, productId) {
        try {
            const result = await this.pool.query('INSERT INTO style_diaries_cart (user_id, product_id) VALUES ($1, $2)', [userId, productId]);
            return result.rowCount > 0; // Return true if the product was added to the cart successfully
        } catch (error) {
            console.error('Error in addToCart:', error);
            return false; // Return false if there was an error
        }
    }

    // Method to get cart items
    async getCartItems(userId) {
        try {
            const result = await this.pool.query('SELECT c.id AS cart_id, p.* FROM style_diaries_cart c JOIN style_diaries_products p ON c.product_id = p.id  WHERE c.user_id = $1', [userId]);
            return result.rows; // Return the cart items for the specified user
        } catch (error) {
            console.error('Error in getCartItems:', error);
        }
    }

    // Method to count card items
    async getCartCount(userId) {
        try {
            const result = await this.pool.query('SELECT COUNT(*) AS total_items FROM style_diaries_cart WHERE user_id = $1', [userId]);
            return result.rows[0]; // Return the cart items for the specified user
        } catch (error) {
            console.error('Error in getCartItems:', error);
        }
    }

    // Method to remove from cart
    async removeFromCart(cartId) {
        try {
            const result = await this.pool.query('DELETE FROM style_diaries_cart WHERE id = $1', [cartId]);
            return result.rowCount > 0; // Return true if the product was removed from the cart successfully
        } catch (error) {
            console.error('Error in removeFromCart:', error);
            return false; // Return false if there was an error
        }
    }

    // Method to remove all items from cart for a user
    async removeAllFromCart(userId) {
        try {
            const result = await this.pool.query('DELETE FROM style_diaries_cart WHERE user_id = $1', [userId]);
            return result.rowCount > 0; // Return true if all items were removed from the cart successfully
        } catch (error) {
            console.error('Error in removeAllFromCart:', error);
            return false; // Return false if there was an error
        }
    }

    // Search for products 
    async searchProducts(query) {
        try {
            const result = await this.pool.query('SELECT * FROM style_diaries_products WHERE name ILIKE $1 OR category ILIKE $1', [`%${query}%`]);
            return result.rows; // Return the products that match the search query
        } catch (error) {
            console.error('Error in searchProducts:', error);
        }
    }

}

module.exports = Database; // Export the Database class for use in other files


            
           
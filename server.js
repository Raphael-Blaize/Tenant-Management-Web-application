const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config(); // Ensure this line loads your .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultSecret',
    resave: false,
    saveUninitialized: false,
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'tenant' }, // Default role is tenant
    email: { type: String, required: true, unique: true },
    contact: { type: String, required: true },
    houseNumber: { type: String, required: true },
    phone: { type: String, required: true },
    payments: [{ date: Date, amount: Number }],
    transactions: [{ date: Date, amount: Number }]
});

const User = mongoose.model('User', userSchema);

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/attendance.html'); // Serve your HTML file
});

// Signup route
app.post('/signup', async (req, res) => {
    const { newUsername, newPassword, email, contact, houseNumber, phone } = req.body;

    // Basic validation checks
    if (!newUsername || !newPassword || !email || !contact || !houseNumber || !phone) {
        return res.status(400).send('All fields are required.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = new User({
            username: newUsername,
            password: hashedPassword,
            email,
            contact,
            houseNumber,
            phone
        });
        await user.save();
        res.redirect('/'); // Redirect to the homepage after signup
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('Username or Email already exists. Please choose a different one.');
        }
        console.error(error);
        res.status(500).send('Error creating user.');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        req.session.role = user.role; // Store user role in session

        // No need to fetch tenant separately, we already have user info
        req.session.username = user.username; // Store username in session
        console.log("Session data after login:", req.session);
        if (user.role === 'admin') {
            res.redirect('/attendance2.html'); // Redirect admin to their dashboard
        } else {
            res.redirect('/Tenantsdash.html'); // Redirect tenants to their dashboard
        }
    } else {
        res.status(401).send('Invalid username or password.');
    }
});

// Dashboard route
app.get('/dashboard', async (req, res) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (!user) return res.status(404).send('User not found.');

            // Send the user's information directly
            res.json({
                username: user.username,
                email: user.email,
                phone: user.phone,
                houseNumber: user.houseNumber,
            });
        } catch (error) {
            console.error("Error retrieving user data:", error);
            res.status(500).send('Error retrieving user data.');
        }
    } else {
        res.redirect('/');
    }
});



// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

// Schema for tenants
const tenantSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    id: { type: Number, required: true, unique: true },
    phone: { type: String, required: true },
    emergency_phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

const Tenant = mongoose.model('Tenant', tenantSchema);

// Handle tenant registration
app.post('/students', async (req, res) => {
    const { first_name, last_name, id, phone, emergency_phone, email } = req.body;

    // Basic validation checks
    if (!first_name || !last_name || !id || !phone || !emergency_phone || !email) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const tenant = new Tenant({
            first_name,
            last_name,
            id,
            phone,
            emergency_phone,
            email
        });
        await tenant.save();

        // Redirect to Tenantview.html with tenant information in query parameters
        res.redirect(`/Tenantview.html?id=${id}&first_name=${encodeURIComponent(first_name)}&last_name=${encodeURIComponent(last_name)}&email=${encodeURIComponent(email)}`);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).send('ID or Email already exists. Please choose a different one.');
        }
        console.error(error);
        res.status(500).send('Error creating tenant.');
    }
});

// Get tenant data by ID
app.get('/students/:id', async (req, res) => {
    try {
        // Find tenant by 'id' field instead of '_id'
        const tenant = await Tenant.findOne({ id: req.params.id }); // Use findOne with the correct field
        if (!tenant) {
            return res.status(404).send('Tenant not found.');
        }
        res.json(tenant); // Send the tenant data back as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving tenant data.');
    }
});


// Get all tenants
app.get('/students', async (req, res) => {
    try {
        const tenants = await Tenant.find(); // Fetch all tenants
        res.json(tenants); // Send the tenant data back as JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving tenant data.');
    }
});

// Delete tenant by ID
app.delete('/students/:id', async (req, res) => {
    try {
        const result = await Tenant.deleteOne({ id: req.params.id }); // Adjust the query based on your schema
        if (result.deletedCount === 0) {
            return res.status(404).send('Tenant not found.');
        }
        res.sendStatus(204); // No content to send back after deletion
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting tenant.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

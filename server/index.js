// server/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    maxTypingSpeed: { type: Number, default: 0 },
    averageTypingSpeed: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Typing Test Schema
const typingTestSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    wpm: Number,
    accuracy: Number,
    mistakes: Number,
    duration: Number,
    timestamp: { type: Date, default: Date.now }
});
const TypingTest = mongoose.model('TypingTest', typingTestSchema);

// Todo Schema
const todoSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    task: String,
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Todo = mongoose.model('Todo', todoSchema);

// Calculator Schema
const calculatorSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    expression: String,
    result: String,
    timestamp: { type: Date, default: Date.now }
});
const Calculator = mongoose.model('Calculator', calculatorSchema);

// Passport Config
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = await new User({
                googleId: profile.id,
                displayName: profile.displayName,
                email: profile.emails[0].value
            }).save();
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

// Routes
// 1. Auth Init
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Auth Callback
app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('http://localhost:3000/dashboard');
    }
);

// 3. Get Current User
app.get('/auth/current_user', (req, res) => {
    res.send(req.user);
});

// 4. Logout
app.get('/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect('http://localhost:3000/');
    });
});

// Typing Test Routes
app.post('/api/typing-test', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const test = new TypingTest({
            userId: req.user._id,
            wpm: req.body.wpm,
            accuracy: req.body.accuracy,
            mistakes: req.body.mistakes,
            duration: req.body.duration
        });
        await test.save();
        
        // Update user's max and average typing speed
        const allTests = await TypingTest.find({ userId: req.user._id });
        const maxSpeed = Math.max(...allTests.map(t => t.wpm));
        const avgSpeed = Math.round(allTests.reduce((sum, t) => sum + t.wpm, 0) / allTests.length);
        
        await User.findByIdAndUpdate(req.user._id, {
            maxTypingSpeed: maxSpeed,
            averageTypingSpeed: avgSpeed
        });
        
        res.json({ test, maxSpeed, avgSpeed });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/typing-test/stats', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const user = await User.findById(req.user._id);
        const tests = await TypingTest.find({ userId: req.user._id }).sort({ timestamp: -1 });
        const lastTest = tests.length > 0 ? tests[0] : null;
        
        res.json({ 
            lastTest, 
            maxTypingSpeed: user.maxTypingSpeed || 0,
            averageTypingSpeed: user.averageTypingSpeed || 0,
            allTests: tests 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Todo Routes
app.post('/api/todos', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const todo = new Todo({
            userId: req.user._id,
            task: req.body.task,
            completed: req.body.completed || false
        });
        await todo.save();
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/todos', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const todos = await Todo.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        await Todo.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const todo = await Todo.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
        res.json(todo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Calculator Routes
app.post('/api/calculator', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const calc = new Calculator({
            userId: req.user._id,
            expression: req.body.expression,
            result: req.body.result
        });
        await calc.save();
        res.json(calc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/calculator/last', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const lastCalc = await Calculator.findOne({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(lastCalc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/calculator/history', async (req, res) => {
    try {
        if (!req.user) return res.status(401).send("Not authenticated");
        
        const history = await Calculator.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
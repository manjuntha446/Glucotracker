const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://127.0.0.1:5501'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));
console.log('Frontend static path:', path.join(__dirname, '../frontend'));

// Import routes
const glucoseRoutes = require('./routes/glucoseRoutes');
const userRoutes = require('./routes/userRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Use routes
app.use('/api/glucose', glucoseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);

// Default route to serve the frontend
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Catch-all route for SPA navigation
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
app.get('/api/some-endpoint', (req, res) => {
  res.json({ message: 'Success' }); // ✅ Must send valid JSON
});
// Catch-all route for any other routes
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/glucotracker';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
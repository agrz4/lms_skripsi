const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/ai', aiRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'LMS Hybrid API is running' });
});

module.exports = app;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares 
app.use(cors());
app.use(express.json());

// 2. Routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/hopdong', require('./routes/hopDongRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.get('/', (req, res) => {
    res.send('API is working');
});

module.exports = app;
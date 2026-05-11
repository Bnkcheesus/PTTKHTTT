const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Routes 
app.use('/api', (req, res, next) => {
    console.log('API call:', req.method, req.originalUrl);
    next();
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/hopdong', require('./routes/hopDongRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/xacnhanthue', require('./routes/xacNhanThueRoutes'));
app.use('/api/deposits', require('./routes/depositRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/phieutraphong', require('./routes/phieuTraPhongRoutes'));
try {
    app.use('/api/reconciliation', require('./routes/reconciliationRoutes'));
    console.log('Reconciliation route registered');
} catch (e) {
    console.error('Error registering reconciliation route:', e.message);
}
app.get('/', (req, res) => {
    res.send('API is working');
});

module.exports = app;
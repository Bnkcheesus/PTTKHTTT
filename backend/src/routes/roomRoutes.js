const express = require('express');
const router = express.Router();
const { getAllRooms } = require('../models/roomModel');

router.get('/', async (req, res) => {
    try {
        const rooms = await getAllRooms();
        res.json(rooms);
    } catch (err) {
        res.status(500).send('Lỗi server rồi: ' + err.message);
    }
});

module.exports = router;
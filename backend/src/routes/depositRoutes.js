const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');

router.get('/paid', depositController.getPaid);
router.get('/approved', depositController.getApproved);
router.post('/approve/:id', depositController.approve);
router.post('/reject/:id', depositController.reject);

module.exports = router;
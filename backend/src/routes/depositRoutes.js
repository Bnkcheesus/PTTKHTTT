const express = require('express');
const router = express.Router();
const depositController = require('../controllers/depositController');

router.get('/paid', depositController.getPaid);
router.get('/approved', depositController.getApproved);
router.post('/approve/:id', depositController.approve);
router.post('/reject/:id', depositController.reject);
router.get('/pending/:cccd', depositController.getPendingRequest);
router.post('/confirm', depositController.confirmRental);
router.get('/info/:cccd', depositController.getDepositInfo);
router.post('/pay', depositController.processPayment);

module.exports = router;
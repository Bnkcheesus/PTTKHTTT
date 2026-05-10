const express = require('express');
const router = express.Router();
const phieuTraPhongController = require('../controllers/phieuTraPhongController');

// Get list of contracts available for return
router.get('/contracts', phieuTraPhongController.getContractsForReturn);

// Get contract detail by deposit ID
router.get('/contract/:MaPhieuDatCoc', phieuTraPhongController.getContractDetail);

// Create return voucher
router.post('/create', phieuTraPhongController.createReturnVoucher);

// Get return voucher detail
router.get('/detail/:MaPhieuTra', phieuTraPhongController.getReturnVoucherDetail);

// Get all return vouchers
router.get('/list', phieuTraPhongController.getAllReturnVouchers);

// Delete return voucher
router.delete('/:MaPhieuTra', phieuTraPhongController.deleteReturnVoucher);

module.exports = router;

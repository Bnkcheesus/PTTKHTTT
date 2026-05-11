const express = require('express');
const router = express.Router();
const {
    getCandidates,
    getCandidateDetail,
    getCreated,
    approveReconciliationHandler,
    getAdditionalPayments,
    createAdditionalPaymentHandler,
    getSalesRefunds,
    liquidateContractHandler,
    submitRefundRequestHandler,
    getAccountingRefunds,
    confirmRefundPaymentHandler,
    createReconciliationHandler,
} = require('../controllers/reconciliationController');

console.log('Reconciliation routes loaded');

router.get('/', (req, res) => {
    console.log('GET /api/reconciliation called');
    getCandidates(req, res);
});
router.get('/created', getCreated);
router.get('/additional-payments', getAdditionalPayments);
router.get('/sales-refunds', getSalesRefunds);
router.get('/accounting-refunds', getAccountingRefunds);
router.post('/:maBang/liquidate', liquidateContractHandler);
router.post('/:maBang/refund-request', submitRefundRequestHandler);
router.post('/:maBang/confirm-refund', confirmRefundPaymentHandler);
router.post('/:maBang/additional-payment', createAdditionalPaymentHandler);
router.post('/:maBang/approve', approveReconciliationHandler);
router.get('/:maPhieuKiemTra', getCandidateDetail);
router.post('/', createReconciliationHandler);

module.exports = router;

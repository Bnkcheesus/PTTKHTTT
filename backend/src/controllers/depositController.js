const DepositModel = require('../models/depositModel');
const hopDongModel = require('../models/hopDongModel');

exports.getPendingRequest = async (req, res) => {
    try {
        const data = await DepositModel.getPendingRequestByCCCD(req.params.cccd);
        if (!data) return res.status(404).json({ message: "Không tìm thấy yêu cầu thuê." });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.confirmRental = async (req, res) => {
    try {
        const maPDC = await DepositModel.createDeposit(req.body);
        res.json({ success: true, maPDC });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDepositInfo = async (req, res) => {
    try {
        const data = await DepositModel.getDepositInfoByCCCD(req.params.cccd);
        if (!data) return res.status(404).json({ message: "Không tìm thấy thông tin đặt cọc." });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.processPayment = async (req, res) => {
    try {
        const { maPDC, hinhThuc } = req.body;
        await DepositModel.updatePaymentStatus(maPDC, hinhThuc);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getPendingPayments = async (req, res) => {
    try {
        const data = await DepositModel.getPendingPayments();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelDeposit = async (req, res) => {
    try {
        await DepositModel.cancelDeposit(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getPaid = async (req, res) => {
    try {
        const data = await hopDongModel.getPaidDepositsNoContract();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getApproved = async (req, res) => {
    try {
        const data = await hopDongModel.getApprovedDepositsNoContract();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.approve = async (req, res) => {
    try {
        await hopDongModel.approveDeposit(req.params.id);
        res.json({ message: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.reject = async (req, res) => {
    try {
        await hopDongModel.rejectDeposit(req.params.id);
        res.json({ message: "Thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
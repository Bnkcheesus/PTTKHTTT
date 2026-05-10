const phieuTraPhongModel = require('../models/phieuTraPhongModel');

// Get list of contracts available for return
exports.getContractsForReturn = async (req, res) => {
    try {
        const data = await phieuTraPhongModel.getContractsForReturn();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get contract detail by deposit ID
exports.getContractDetail = async (req, res) => {
    try {
        const { MaPhieuDatCoc } = req.params;
        const data = await phieuTraPhongModel.getContractDetail(MaPhieuDatCoc);
        if (!data) {
            return res.status(404).json({ error: 'Contract not found' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create return voucher
exports.createReturnVoucher = async (req, res) => {
    try {
        const { MaPhieuDatCoc, NgayTraPhong, TinhTrangHD, MaNV } = req.body;

        // Validation
        if (!MaPhieuDatCoc || !NgayTraPhong || !TinhTrangHD || !MaNV) {
            return res.status(400).json({
                error: 'Missing required fields: MaPhieuDatCoc, NgayTraPhong, TinhTrangHD, MaNV'
            });
        }

        const result = await phieuTraPhongModel.createReturnVoucher({
            MaPhieuDatCoc,
            NgayTraPhong,
            TinhTrangHD,
            MaNV
        });

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get return voucher detail
exports.getReturnVoucherDetail = async (req, res) => {
    try {
        const { MaPhieuTra } = req.params;
        const data = await phieuTraPhongModel.getReturnVoucherDetail(MaPhieuTra);
        if (!data) {
            return res.status(404).json({ error: 'Return voucher not found' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get all return vouchers
exports.getAllReturnVouchers = async (req, res) => {
    try {
        const data = await phieuTraPhongModel.getAllReturnVouchers();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete return voucher
exports.deleteReturnVoucher = async (req, res) => {
    try {
        const { MaPhieuTra } = req.params;
        await phieuTraPhongModel.deleteReturnVoucher(MaPhieuTra);
        res.json({ success: true, message: 'Return voucher deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

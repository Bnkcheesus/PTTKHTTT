const roomModel = require('../models/roomModel');

exports.getInspectionCandidates = async (req, res) => {
    try {
        const data = await roomModel.getInspectionCandidates();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getHandoverInfo = async (req, res) => {
    try {
        const { MaPhieuTra } = req.params;
        const data = await roomModel.getHandoverInfoFromReturnVoucher(MaPhieuTra);
        if (!data) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin bàn giao cho phiếu trả phòng này.' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createInspectionVoucher = async (req, res) => {
    try {
        const {
            MaPhieuKiemTra,
            MaPhieuTra,
            SoDienDung = 0,
            SoNuocDung = 0,
            TienThueNo,
            TienPhat,
            MaNV,
        } = req.body;

        if (!MaPhieuTra || TienThueNo == null || TienPhat == null || !MaNV) {
            return res.status(400).json({
                error: 'Vui lòng điền đầy đủ các trường: MaPhieuTra, TienThueNo, TienPhat, MaNV'
            });
        }

        const result = await roomModel.createInspectionVoucher({
            MaPhieuKiemTra,
            MaPhieuTra,
            SoDienDung,
            SoNuocDung,
            TienThueNo,
            TienPhat,
            MaNV,
        });

        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addInspectionDetail = async (req, res) => {
    try {
        const { MaPhieuKiemTra } = req.params;
        const { MaThietBi, SoLuongHuHong } = req.body;

        if (!MaThietBi || SoLuongHuHong == null) {
            return res.status(400).json({ error: 'Vui lòng cung cấp MaThietBi và SoLuongHuHong.' });
        }

        await roomModel.addInspectionDetail(MaPhieuKiemTra, MaThietBi, SoLuongHuHong);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
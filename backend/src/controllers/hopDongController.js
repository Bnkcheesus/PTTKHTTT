const hopDongModel = require('../models/hopDongModel');

// 1. Lấy danh sách hợp đồng
exports.getContracts = async (req, res) => {
    try {
        const data = await hopDongModel.getContractList();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Lấy danh sách thiết bị
exports.getEquipments = async (req, res) => {
    try {
        const data = await hopDongModel.getEquipmentList();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Tạo biên bản mới cho hợp đồng
exports.initBienBan = async (req, res) => {
    try {
        const { MaHD, MaNV } = req.body;
        await hopDongModel.createBienBan(MaHD, MaNV);
        res.json({ success: true, message: "Khởi tạo biên bản thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Lấy chi tiết biên bản (các thiết bị đã thêm)
exports.getBienBanDetails = async (req, res) => {
    try {
        const { MaHD } = req.params;
        const data = await hopDongModel.getBienBanDetails(MaHD);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Thêm thiết bị vào biên bản
exports.addItem = async (req, res) => {
    try {
        const { MaHD, MaTB, SoLuong } = req.body;
        await hopDongModel.addBienBanDetail(MaHD, MaTB, SoLuong);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Xóa thiết bị khỏi biên bản
exports.removeItem = async (req, res) => {
    try {
        const { MaHD, MaTB } = req.body;
        await hopDongModel.removeBienBanDetail(MaHD, MaTB);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
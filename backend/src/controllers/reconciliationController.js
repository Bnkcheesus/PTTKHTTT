const {
    getReconciliationCandidates,
    getReconciliationCandidateById,
    getCreatedReconciliations,
    approveReconciliation,
    getAdditionalPaymentReconciliations,
    createAdditionalPaymentInvoice,
    getSalesRefundCandidates,
    liquidateContractForRefund,
    submitRefundRequest,
    getAccountingRefundRequests,
    confirmRefundPayment,
    createReconciliation,
} = require('../models/reconciliationModel');

const getCandidates = async (req, res) => {
    try {
        const data = await getReconciliationCandidates();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get reconciliation candidates error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ success: false, message: 'Không lấy được danh sách đối soát.' });
    }
};

const getCandidateDetail = async (req, res) => {
    try {
        const { maPhieuKiemTra } = req.params;
        const data = await getReconciliationCandidateById(maPhieuKiemTra);
        if (!data) {
            return res.status(404).json({ success: false, message: 'Phiếu kiểm tra không tồn tại.' });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get reconciliation candidate detail error:', error.message);
        res.status(500).json({ success: false, message: 'Không lấy được chi tiết đối soát.' });
    }
};

const getCreated = async (req, res) => {
    try {
        const data = await getCreatedReconciliations();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get created reconciliations error:', error.message);
        res.status(500).json({ success: false, message: 'Không lấy được danh sách phiếu đối soát.' });
    }
};

const approveReconciliationHandler = async (req, res) => {
    try {
        const { maBang } = req.params;
        const data = await approveReconciliation(maBang);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Approve reconciliation error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể duyệt phiếu đối soát.' });
    }
};

const getAdditionalPayments = async (req, res) => {
    try {
        const data = await getAdditionalPaymentReconciliations();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get additional payment reconciliations error:', error.message);
        res.status(500).json({ success: false, message: 'Không lấy được danh sách thanh toán phát sinh.' });
    }
};

const createAdditionalPaymentHandler = async (req, res) => {
    try {
        const { maBang } = req.params;
        const data = await createAdditionalPaymentInvoice(maBang);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Create additional payment invoice error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể xác nhận thanh toán phát sinh.' });
    }
};

const getSalesRefunds = async (req, res) => {
    try {
        const data = await getSalesRefundCandidates();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get sales refund candidates error:', error.message);
        res.status(500).json({ success: false, message: 'Không lấy được danh sách hồ sơ hoàn cọc.' });
    }
};

const liquidateContractHandler = async (req, res) => {
    try {
        const { maBang } = req.params;
        const data = await liquidateContractForRefund(maBang);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Liquidate contract error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể thanh lý hợp đồng.' });
    }
};

const submitRefundRequestHandler = async (req, res) => {
    try {
        const { maBang } = req.params;
        const { HinhThucHoanCoc } = req.body;

        if (!HinhThucHoanCoc) {
            return res.status(400).json({ success: false, message: 'Hình thức hoàn cọc là bắt buộc.' });
        }

        const data = await submitRefundRequest({ maBang, hinhThucHoanCoc: HinhThucHoanCoc });
        res.json({ success: true, data });
    } catch (error) {
        console.error('Submit refund request error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể gửi hồ sơ hoàn cọc.' });
    }
};

const getAccountingRefunds = async (req, res) => {
    try {
        const data = await getAccountingRefundRequests();
        res.json({ success: true, data });
    } catch (error) {
        console.error('Get accounting refunds error:', error.message);
        res.status(500).json({ success: false, message: 'Không lấy được danh sách hoàn cọc.' });
    }
};

const confirmRefundPaymentHandler = async (req, res) => {
    try {
        const { maBang } = req.params;
        const data = await confirmRefundPayment(maBang);
        res.json({ success: true, data });
    } catch (error) {
        console.error('Confirm refund payment error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể xác nhận hoàn cọc.' });
    }
};

const createReconciliationHandler = async (req, res) => {
    try {
        const { MaPhieuKiemTra, GiaDien, GiaNuoc, TienNoKhac } = req.body;

        if (!MaPhieuKiemTra) {
            return res.status(400).json({ success: false, message: 'Mã phiếu kiểm tra là bắt buộc.' });
        }

        const data = await createReconciliation({
            maPhieuKiemTra: MaPhieuKiemTra,
            giaDien: GiaDien,
            giaNuoc: GiaNuoc,
            tienNoKhac: TienNoKhac,
        });

        res.json({ success: true, data });
    } catch (error) {
        console.error('Create reconciliation error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Không thể lập bảng đối soát.' });
    }
};

module.exports = {
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
};

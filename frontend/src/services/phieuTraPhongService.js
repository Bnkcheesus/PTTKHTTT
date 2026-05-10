import axios from 'axios';

const API_URL = 'http://localhost:5000/api/phieutraphong';

const phieuTraPhongService = {
    // Get list of contracts available for return
    getContractsForReturn: async () => {
        const res = await axios.get(`${API_URL}/contracts`);
        return res.data;
    },

    // Get contract detail by deposit ID
    getContractDetail: async (MaPhieuDatCoc) => {
        const res = await axios.get(`${API_URL}/contract/${MaPhieuDatCoc}`);
        return res.data;
    },

    // Create return voucher
    createReturnVoucher: async (MaPhieuDatCoc, NgayTraPhong, TinhTrangHD, MaNV) => {
        const res = await axios.post(`${API_URL}/create`, {
            MaPhieuDatCoc,
            NgayTraPhong,
            TinhTrangHD,
            MaNV
        });
        return res.data;
    },

    // Get return voucher detail
    getReturnVoucherDetail: async (MaPhieuTra) => {
        const res = await axios.get(`${API_URL}/detail/${MaPhieuTra}`);
        return res.data;
    },

    // Get all return vouchers
    getAllReturnVouchers: async () => {
        const res = await axios.get(`${API_URL}/list`);
        return res.data;
    },

    // Delete return voucher
    deleteReturnVoucher: async (MaPhieuTra) => {
        const res = await axios.delete(`${API_URL}/${MaPhieuTra}`);
        return res.data;
    }
};

export default phieuTraPhongService;

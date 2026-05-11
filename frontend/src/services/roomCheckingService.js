import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rooms';

const roomCheckingService = {
    getInspectionCandidates: async () => {
        const res = await axios.get(`${API_URL}/inspection/list`);
        return res.data;
    },

    getHandoverInfo: async (MaPhieuTra) => {
        const res = await axios.get(`${API_URL}/inspection/${MaPhieuTra}`);
        return res.data;
    },

    createInspectionVoucher: async (payload) => {
        const res = await axios.post(`${API_URL}/inspection`, payload);
        return res.data;
    },

    addInspectionDetail: async (MaPhieuKiemTra, MaThietBi, SoLuongHuHong) => {
        const res = await axios.post(`${API_URL}/inspection/${MaPhieuKiemTra}/details`, {
            MaThietBi,
            SoLuongHuHong,
        });
        return res.data;
    },
};

export default roomCheckingService;
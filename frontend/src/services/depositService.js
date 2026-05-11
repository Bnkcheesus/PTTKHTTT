import axios from 'axios';

// Đảm bảo PORT là 5000 (khớp với log backend của bạn)
const API_URL = 'http://localhost:5000/api/hopdong';

const depositService = {
    // Khớp với: router.get('/deposits-paid')
    getPaidDeposits: async () => {
        const response = await axios.get(`${API_URL}/deposits-paid`);
        return response.data;
    },

    // Khớp với: router.get('/deposits-approved')
    getApprovedDeposits: async () => {
        const response = await axios.get(`${API_URL}/deposits-approved`);
        return response.data;
    },

    // Khớp với: router.post('/deposit/:maPhieu/approve')
    approveDeposit: async (maPhieu) => {
        const response = await axios.post(`${API_URL}/deposit/${maPhieu}/approve`);
        return response.data;
    },

    // Khớp với: router.post('/deposit/:maPhieu/reject')
    rejectDeposit: async (maPhieu) => {
        const response = await axios.post(`${API_URL}/deposit/${maPhieu}/reject`);
        return response.data;
    },

    getPending: async (cccd) => {
        const res = await axios.get(`${API_URL}/pending/${cccd}`);
        return res.data;
    },
    confirm: async (payload) => {
        const res = await axios.post(`${API_URL}/confirm`, payload);
        return res.data;
    },
    getInfo: async (cccd) => {
        const res = await axios.get(`${API_URL}/info/${cccd}`);
        return res.data;
    },
    pay: async (maPDC, hinhThuc) => {
        const res = await axios.post(`${API_URL}/pay`, { maPDC, hinhThuc });
        return res.data;
    },
    // Cập nhật thông tin khách hàng
    updateCustomer: async (data) => {
        const response = await axios.post(`${API_URL}/update-customer`, data);
        return response.data;
    }
};

export default depositService;
import axios from 'axios';

// Đảm bảo PORT là 5000 (khớp với log backend của bạn)
const API_URL = 'http://localhost:5000/api/hopdong';
const DEPOSIT_API_URL = 'http://localhost:5000/api/deposits';

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

    getInfo: async (cccd) => {
        const response = await axios.get(`${DEPOSIT_API_URL}/info/${cccd}`);
        return response.data;
    },

    pay: async (maPDC, hinhThuc) => {
        const response = await axios.post(`${DEPOSIT_API_URL}/pay`, { maPDC, hinhThuc });
        return response.data;
    }
};

export default depositService;

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reconciliation';

const reconciliationService = {
    getCandidates: async () => {
        const response = await axios.get(API_URL);
        return response.data.data;
    },

    getCandidateDetail: async (maPhieuKiemTra) => {
        const response = await axios.get(`${API_URL}/${maPhieuKiemTra}`);
        return response.data.data;
    },

    createReconciliation: async (payload) => {
        const response = await axios.post(API_URL, payload);
        return response.data.data;
    },

    getCreatedReconciliations: async () => {
        const response = await axios.get(`${API_URL}/created`);
        return response.data.data;
    },

    approveReconciliation: async (maBang) => {
        const response = await axios.post(`${API_URL}/${maBang}/approve`);
        return response.data.data;
    },

    getAdditionalPayments: async () => {
        const response = await axios.get(`${API_URL}/additional-payments`);
        return response.data.data;
    },

    createAdditionalPayment: async (maBang) => {
        const response = await axios.post(`${API_URL}/${maBang}/additional-payment`);
        return response.data.data;
    },

    getSalesRefunds: async () => {
        const response = await axios.get(`${API_URL}/sales-refunds`);
        return response.data.data;
    },

    liquidateContract: async (maBang) => {
        const response = await axios.post(`${API_URL}/${maBang}/liquidate`);
        return response.data.data;
    },

    submitRefundRequest: async (maBang, hinhThucHoanCoc) => {
        const response = await axios.post(`${API_URL}/${maBang}/refund-request`, {
            HinhThucHoanCoc: hinhThucHoanCoc,
        });
        return response.data.data;
    },

    getAccountingRefunds: async () => {
        const response = await axios.get(`${API_URL}/accounting-refunds`);
        return response.data.data;
    },

    confirmRefundPayment: async (maBang) => {
        const response = await axios.post(`${API_URL}/${maBang}/confirm-refund`);
        return response.data.data;
    },
};

export default reconciliationService;

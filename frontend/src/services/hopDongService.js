import axios from 'axios';

const API_URL = 'http://localhost:5000/api/hopdong';

const hopDongService = {
    // Get paid deposits without contracts
    getPaidDepositsNoContract: async () => {
        const res = await axios.get(`${API_URL}/deposits-paid`);
        return res.data;
    },

    // Get approved deposits without contracts
    getApprovedDepositsNoContract: async () => {
        const res = await axios.get(`${API_URL}/deposits-approved`);
        return res.data;
    },

    // Create a new contract
    createContract: async (MaPhieu, NgayBatDau, NgayKetThuc, NoiDungHD, MaNV) => {
        const res = await axios.post(`${API_URL}/create`, {
            MaPhieu,
            NgayBatDau,
            NgayKetThuc,
            NoiDungHD,
            MaNV
        });
        return res.data;
    },

    // Get contract details after creation
    getContractList: async () => {
        const res = await axios.get(`${API_URL}/list`);
        return res.data;
    },

    getEquipmentList: async () => {
        const res = await axios.get(`${API_URL}/equipment/list`);
        return res.data;
    }
};

export default hopDongService;

import axios from 'axios';

// Đảm bảo PORT là 5000
const API_URL = 'http://localhost:5000/api/hopdong';

const bienBanService = {
    getContracts: async () => {
        const res = await axios.get(`${API_URL}/contracts`);
        return res.data; // SQL trả về mảng dữ liệu
    },
    getEquipments: async () => {
        const res = await axios.get(`${API_URL}/equipments`);
        return res.data;
    },
    initBienBan: async (MaHD) => {
        // Khớp với router.post('/bienban/init')
        const res = await axios.post(`${API_URL}/bienban/init`, { MaHD });
        return res.data;
    },
    getDetails: async (MaHD) => {
        // Khớp với router.get('/bienban/:MaHD/details')
        const res = await axios.get(`${API_URL}/bienban/${MaHD}/details`);
        return res.data;
    }
};

export default bienBanService;
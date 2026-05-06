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
    initBienBan: async (MaHD, MaNV) => {
        // Khớp với router.post('/bienban/init')
        const res = await axios.post(`${API_URL}/bienban/init`, { MaHD, MaNV });
        return res.data;
    },
    getDetails: async (MaHD) => {
        // Khớp với router.get('/bienban/:MaHD/details')
        const res = await axios.get(`${API_URL}/bienban/${MaHD}/details`);
        return res.data;
    },
    addItem: async (MaHD, MaTB, SoLuong) => {
        const res = await axios.post(`${API_URL}/bienban/add-item`, { MaHD, MaTB, SoLuong });
        return res.data;
    },
    removeItem: async (MaHD, MaTB) => {
        const res = await axios.post(`${API_URL}/bienban/remove-item`, { MaHD, MaTB });
        return res.data;
    },
    deleteBienBan: async (MaHD) => {
        console.log('Calling deleteBienBan with MaHD:', MaHD);
        const res = await axios.post(`${API_URL}/bienban/delete`, { MaHD });
        console.log('Delete response:', res.data);
        return res.data;
    }
};

export default bienBanService;
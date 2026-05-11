import axios from 'axios';

const API_URL = 'http://localhost:5000/api/appointments';

const appointmentService = {
    getPendingConfirmations: async () => {
        const response = await axios.get(`${API_URL}/to-confirm`);
        return response.data;
    },
};

export default appointmentService;

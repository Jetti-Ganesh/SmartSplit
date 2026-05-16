import axios from 'axios';

const API_URL = 'http://localhost:3000/api/analytics'; // Adjust if backend runs on different port

export const fetchAnalytics = async (period = 'month', customRange = null) => {
    try {
        let params = { period };
        if (period === 'custom' && customRange) {
            params.startDate = customRange.startDate;
            params.endDate = customRange.endDate;
        }

        const response = await axios.get(API_URL, {
            params,
            withCredentials: true // For session
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

export const seedDummyExpenses = async () => {
    try {
        const response = await axios.post(`${API_URL}/seed`, {}, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error('Error seeding expenses:', error);
        throw error;
    }
};

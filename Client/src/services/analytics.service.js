import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/analytics`;

export const fetchAnalytics = async (period = 'month', customRange = null) => {
    try {
        let params = { period };
        if (period === 'custom' && customRange) {
            params.startDate = customRange.startDate;
            params.endDate = customRange.endDate;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get(API_URL, {
            params,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

export const seedDummyExpenses = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/seed`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error seeding expenses:', error);
        throw error;
    }
};

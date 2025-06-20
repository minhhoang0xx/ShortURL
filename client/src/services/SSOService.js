import axios from 'axios';

export const checkLogin = async (token) => {
    try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/SSO/CheckLogin`, `"${token}"`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        return res.data;
    } catch (error) {
        console.error('SSO checkLogin error:', error.response?.data || error.message);
        throw error;
    }
};
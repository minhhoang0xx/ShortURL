import axios from 'axios';

export const saveRequest = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/FormRequest/saveRequest`,data);
    return res.data; 
}
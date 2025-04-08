import axios from 'axios';

export const saveRequestBAE = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/FormRequest/saveRequestBAE`,data);
    return res.data; 
}

export const saveRequestStaxi = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/FormRequest/saveRequestStaxi`,data);
    return res.data; 
}
import axios from 'axios';

export const download = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/Download/download`);
    return res.data; 
}
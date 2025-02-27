import axios from 'axios';
export const axiosJWT = axios.create(); 

export const getAllLink = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ShortURL/`);
    return res.data; 
}
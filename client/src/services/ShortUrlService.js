import axios from 'axios';
export const axiosJWT = axios.create(); 

export const getAllLink = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ShortUrl/getAll`);
    return res.data; 
}
export const createShortLink = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/ShortUrl/shorter`, data);
    return res.data; 
}
export const getLink = async (id) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ShortUrl/getLink/${id}`);
    return res.data; 
}
export const updateShortLink = async (id, data) => {
    const res = await axios.put(`${process.env.REACT_APP_API_URL}/ShortUrl/update/${id}`, data);
    return res.data; 
}
export const deleteShortLink = async (id) => {
    const res = await axios.delete(`${process.env.REACT_APP_API_URL}/ShortUrl/delete/${id}`);
    return res.data; 
}
export const download = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ShortUrl/download`);
    return res.data; 
}
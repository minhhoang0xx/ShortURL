import axios from 'axios';
export const axiosJWT = axios.create(); 
axiosJWT.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token'); 
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

export const getAllLink = async () => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/ShortUrl/getAll`);
    return res.data; 
}
export const createShortLink = async (data) => {
    const res = await axiosJWT.post(`${process.env.REACT_APP_API_URL}/ShortUrl/shorter`, data);
    return res.data; 
}
export const getLink = async (id) => {
    const res = await axiosJWT.get(`${process.env.REACT_APP_API_URL}/ShortUrl/getLink/${id}`);
    return res.data; 
}
export const getLinkByAlias = async (alias) => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/ShortUrl/${alias}`);
    return res.data; 
}
export const updateShortLink = async (id, data) => {
    const res = await axiosJWT.put(`${process.env.REACT_APP_API_URL}/ShortUrl/update/${id}`, data);
    return res.data; 
}
export const deleteShortLink = async (id) => {
    const res = await axiosJWT.delete(`${process.env.REACT_APP_API_URL}/ShortUrl/delete/${id}`);
    return res.data; 
}
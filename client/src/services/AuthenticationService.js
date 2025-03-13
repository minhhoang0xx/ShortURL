import axios from 'axios';

export const Login = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/Authentication/Login`,data);
    return res.data; 
}
import { message } from 'antd';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";


export const Login = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/Authentication/Login`,data);
    if(res.data.message === "Login successfully!") {
        const token = res.data.token;
        localStorage.setItem(`${process.env.REACT_APP_TOKEN_KEY}`, token.toString());
    }
    return res.data; 
}
export const Logout = async () => {
    localStorage.removeItem(`${process.env.REACT_APP_TOKEN_KEY}`);
}

export const isLoggedIn = () => {
    const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    if(!token) {
        return false;
    }
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; 
        if (currentTime > decodedToken.exp) { 
            Logout();
            return false;
        }
        return true;
    } catch (error) {
        console.error("Invalid token:", error);
        message.warning("you have to Login again!")
        Logout();
        window.location.href = "/Login";
        return false;
    }
}

export const getToken = () => {
    return localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
}
//thêm token vào header
axios.interceptors.request.use(
    async (config) => {
        const token = getToken();
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    async (error) => {
        return Promise.reject(error);
    }
)
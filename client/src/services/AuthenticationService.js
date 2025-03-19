import axios from 'axios';

export const Login = async (data) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/Authentication/Login`,data);
    if(res.data.message === "Login successfully!") {
        const token = 1;
        localStorage.setItem(`${process.env.REACT_APP_TOKEN_KEY}`, token.toString());
        const expiryTime = Date.now() + 1000 * 60 * 0.5 ;
        localStorage.setItem(`${process.env.REACT_APP_EXPIRY_KEY}`, expiryTime.toString());
    }
    return res.data; 
}
export const Logout = async () => {
    localStorage.removeItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    localStorage.removeItem(`${process.env.REACT_APP_EXPIRY_KEY}`);
}

export const isLoggedIn = () => {
    const token = localStorage.getItem(`${process.env.REACT_APP_TOKEN_KEY}`);
    const expiry = localStorage.getItem(`${process.env.REACT_APP_EXPIRY_KEY}`);
    if(!token || !expiry) {
        return false;
    }
    const currentTime = Date.now();
    if(currentTime > parseInt(expiry)) {
        Logout();
        return false;
    }
    return true;
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
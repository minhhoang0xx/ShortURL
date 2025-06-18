import axios from 'axios';

export const checkLogin = async (token) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/SSO/${token}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  };
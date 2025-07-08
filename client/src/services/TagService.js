import axios from 'axios';


export const getAllTags = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}/Tag/tags`);
    return res.data;
  };
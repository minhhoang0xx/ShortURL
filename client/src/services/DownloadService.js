import axios from 'axios';

export const download = async (filteredData) => {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}/Download/download`,filteredData,{responseType: "blob"});
    return res.data; 
}
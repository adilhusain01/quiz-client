import axios from 'axios';

const BASE_URL = import.meta.env.VITE_SERVER_URI;

export default axios.create({
  baseURL: BASE_URL,
});
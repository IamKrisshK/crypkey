import axios from "axios";

const api = axios.create({
  baseURL: "https://crypkey.onrender.com/api",
  withCredentials: true,
});

export default api;

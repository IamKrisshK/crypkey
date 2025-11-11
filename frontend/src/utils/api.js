import axios from "axios";

const api = axios.create({
  baseURL: "https://crypkey.onrender.com/api",
});

export default api;

import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const instance = axios.create({ baseURL: API });

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("oyi_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;

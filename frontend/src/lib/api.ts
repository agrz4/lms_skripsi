import axios from 'axios';

// Alamat backend dibaca dari environment agar tidak perlu mengubah kode
// saat aplikasi dijalankan di komputer atau jaringan lain.
// Buat file frontend/.env berisi:  VITE_API_URL=http://localhost:5000/api
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Create an Axios instance with the base URL and default headers
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // Use Vite's environment variable system
    headers: {
        'Content-Type': 'application/json',
    },
});

// No need to use 'axios.create' for images, just export the base URL
const apiImagesBaseUrl = import.meta.env.VITE_APIIMAGES_BASE_URL;

export default api;
export { apiImagesBaseUrl };

import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({
    baseURL: rawBaseUrl.includes('/api') ? rawBaseUrl : `${rawBaseUrl}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 responses — purge session only for protected API calls (not auth routes)
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/google-token'];
let _isRedirecting = false;

api.interceptors.response.use(
    (response) => {
        // Reset the flag on any successful response (e.g. after re-login)
        _isRedirecting = false;
        return response;
    },
    (error) => {
        const requestUrl: string = error.config?.url || '';
        const isAuthRoute = AUTH_ROUTES.some(route => requestUrl.includes(route));

        // Only purge session for 401 on protected routes (not login/register failures)
        if (error.response?.status === 401 && !isAuthRoute && !_isRedirecting) {
            _isRedirecting = true;

            // Vider tout le localStorage (token, user, store zustand, etc.)
            localStorage.clear();
            sessionStorage.clear();

            // Supprimer tous les cookies de session
            document.cookie.split(';').forEach((cookie) => {
                const name = cookie.trim().split('=')[0];
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            });

            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
        return Promise.reject(error);
    }
);

export default api;

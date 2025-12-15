import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

// helper: run queued requests after refresh completes
function processQueue(error, newAccessToken = null) {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(newAccessToken);
    });
    refreshQueue = [];
}

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// IMPORTANT: use a "raw" axios instance for refresh to avoid interceptor loops
const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If no response or not a 401, just fail
        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        // Prevent infinite retry loops
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
            // no refresh token => force logout / redirect
            return Promise.reject(error);
        }

        // If a refresh is already happening, wait for it then retry
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    resolve: (newAccessToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Change this to your refresh endpoint + payload format
            const { data } = await refreshClient.post("/auth/token/refresh/", {
                refresh: refreshToken,
            });

            const newAccessToken = data.access; // adjust if your backend uses a different key
            localStorage.setItem("access", newAccessToken);

            processQueue(null, newAccessToken);

            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);

            // Refresh failed => clear tokens and force logout
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;

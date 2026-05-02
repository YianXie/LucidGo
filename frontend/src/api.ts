import axios, { type AxiosError } from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isRefreshing = false;
type QueueItem = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};
let refreshQueue: QueueItem[] = [];

const processQueue = (error: unknown, newAccessToken: string | null = null) => {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else if (newAccessToken) resolve(newAccessToken);
    });
    refreshQueue = [];
};

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (!error.response || error.response.status !== 401) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    resolve: (newAccessToken: string) => {
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
            const { data } = await refreshClient.post<{ access: string }>(
                "/auth/token/refresh/",
                {
                    refresh: refreshToken,
                }
            );

            const newAccessToken = data.access;
            localStorage.setItem("access", newAccessToken);

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);

            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;

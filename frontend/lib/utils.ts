import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const API_BASE_URL = (() => {
    if (typeof window !== 'undefined') {
        const env = process.env.NEXT_PUBLIC_ENV;
        if (env === 'production') {
            return process.env.NEXT_PUBLIC_API_URL || window.location.origin.replace('3000', '8000');
        }
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
})();

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('请求超时，请检查网络连接后重试'));
        }
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
            return Promise.reject(new Error('网络连接失败，请检查后端服务是否启动'));
        }
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            if (status === 429) {
                return Promise.reject(new Error('请求过于频繁，请稍后再试'));
            }
            if (status === 401) {
                return Promise.reject(new Error('API Key 无效或已过期'));
            }
            if (status === 500) {
                return Promise.reject(new Error(data?.detail || '服务器内部错误'));
            }
            return Promise.reject(new Error(data?.detail || `请求失败 (${status})`));
        }
        return Promise.reject(error);
    }
);

export { apiClient };


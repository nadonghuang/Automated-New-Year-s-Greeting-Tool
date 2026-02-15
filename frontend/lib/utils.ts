import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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


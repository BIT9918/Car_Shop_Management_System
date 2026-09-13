// Centralized API and Backend configuration
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const IMG_BASE = `${BACKEND_URL}/storage/cars/`;

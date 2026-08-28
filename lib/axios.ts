import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import type { AxiosRequestConfig } from "axios";

export const fetcher = axios.create({
  baseURL: "/api/",
  validateStatus(status) {
    return status < 500;
  },
});

export const axiosNoUser = axios.create({
  baseURL: "/api/",
  validateStatus(status) {
    return status < 500;
  },
});

export const midFetcher = axios.create({
  baseURL: "/api/",
  validateStatus(status) {
    return status < 500;
  },
});
export const apiFetcher = axios.create({
  baseURL: "",
  validateStatus(status) {
    return status < 500;
  },
});

apiFetcher.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

fetcher.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

fetcher.interceptors.response.use(
  (response) => {
    if (response.status >= 500) {
      toast.error("server error");
    } else if (response.status >= 400) {
      toast.error(
        response.data.detail || response.data.error || "unknown error"
      );
    } else if (response.data.detail) {
    }

    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration, e.g., refresh the token
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to determine if a request should be queued
 * Activity-related requests (activity/ and reports/) should be queued when offline
 */
export function shouldQueueRequest(url: string): boolean {
  return url.includes("activity/") || url.includes("reports/");
}

/**
 * Helper to create a queuable request config
 * This adds metadata that can be used by hooks to queue requests
 */
export function createQueuableRequest(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  data?: any
): {
  url: string;
  method: "POST" | "PUT" | "DELETE";
  payload: any;
  type: "activity" | "report";
} {
  const type: "activity" | "report" = url.includes("reports/")
    ? "report"
    : "activity";

  return {
    url,
    method,
    payload: data,
    type,
  };
}

export default fetcher;

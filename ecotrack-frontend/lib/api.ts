import axios, { AxiosError } from "axios";
import {
  AuthResponse,
  EnergyUsage,
  ErrorResponse,
  EnergyUsagePayload,
} from "@/types";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/eco-track",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const login = async (email: string, password: string) =>
  api.post<AuthResponse>("/login", { email, password });

// Fetch all users
export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};

// Fetch energy usage for a specific user
export const getEnergyUsages = async (userId?: number) => {
  console.log(userId);
  const endpoint = userId ? `/energy-usages/{id}=${userId}` : "/energy-usages";
  const response = await api.get<EnergyUsage[]>(endpoint);
  return response;
};

export const addEnergyUsage = async (
  payload: EnergyUsagePayload
): Promise<EnergyUsage> => {
  try {
    const response = await api.post<EnergyUsage>("/energy-usages", payload);
    // Assuming the API returns the newly created EnergyUsage object upon success (201 Created)
    return response.data;
  } catch (error) {
    console.error("API Error (addEnergyUsage):", error);
    throw error; // Re-throw for component handling
  }
};

// Helper to extract error messages from Axios errors
export const getApiErrorMessage = (error: unknown): string => {
  console.log("Raw error in getApiErrorMessage:", error); // Debugging log
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const data = axiosError.response?.data;
    const status = axiosError.response?.status;
    console.log("Axios error data:", data); // Debugging log
    console.log("Axios error status:", status); // Debugging log

    let message = `Error: ${status || "Unknown Status"}`; // Default message with status

    if (data) {
      // Check for Laravel validation errors first
      if (data.error && typeof data.error === "object") {
        message = Object.values(data.error).flat().join(", ");
      }
      // Check for a general 'message' key (common in Laravel JSON responses)
      else if (data.message && typeof data.message === "string") {
        message = data.message;
      }
      // Check for a general 'error' key
      else if (data.error && typeof data.error === "string") {
        message = data.error;
      }
      // If data is just a string (less common for APIs, but possible)
      else if (typeof data === "string") {
        message = data;
      }
      // Fallback if keys are different or data structure is unexpected
      else if (status) {
        message =
          axiosError.message || `Request failed with status code ${status}`;
      }
    } else if (axiosError.request) {
      // The request was made but no response was received
      message =
        "No response received from server. Check network or API status.";
    } else {
      // Something happened in setting up the request that triggered an Error
      message = axiosError.message || "Error setting up API request.";
    }
    return message;
  }
  // Fallback for non-Axios errors
  return error instanceof Error ? error.message : "An unknown error occurred.";
};
export default api;

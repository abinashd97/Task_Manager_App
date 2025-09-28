// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth"; // Direct backend URL

// Get the current user (token from localStorage) - defined early for interceptor
const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Add a request interceptor to include the JWT token
axios.interceptors.request.use(
  (config) => {
    const user = getCurrentUser();
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Register a new user
const register = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
    });
    return response.data; // usually a success message
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// Login user and store token in localStorage
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });

    if (response.data.token) {
      localStorage.setItem("user", JSON.stringify(response.data)); // Save token & other details
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

// Logout user (remove token)
const logout = () => {
  localStorage.removeItem("user");
};


// Check if user is authenticated
const isAuthenticated = () => {
  const user = getCurrentUser();
  return user && user.token;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
};

export default authService;

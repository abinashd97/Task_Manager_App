// src/services/taskService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/tasks"; // Adjust base URL if needed

// Helper to get auth header
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};

// Get all tasks
const getAllTasks = async () => {
  return axios.get(`${API_URL}/all`, { headers: authHeader() });
};

// Get a task by ID
const getTaskById = async (id) => {
  return axios.get(`${API_URL}/get/${id}`, { headers: authHeader() });
};

// Create a new task
const createTask = async (task) => {
  return axios.post(`${API_URL}/create`, task, { headers: authHeader() });
};

// Update a task by ID
const updateTask = async (id, task) => {
  return axios.put(`${API_URL}/update/${id}`, task, { headers: authHeader() });
};

// Delete a task by ID
const deleteTask = async (id) => {
  return axios.delete(`${API_URL}/delete/${id}`, { headers: authHeader() });
};

const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;

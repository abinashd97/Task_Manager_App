import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the services to avoid axios import issues
jest.mock('./Service/AuthService', () => ({
  getCurrentUser: jest.fn(() => null),
  logout: jest.fn(),
}));

jest.mock('./Service/TaskService', () => ({
  getAllTasks: jest.fn(() => Promise.resolve({ data: [] })),
  createTask: jest.fn(() => Promise.resolve({ data: {} })),
  updateTask: jest.fn(() => Promise.resolve({ data: {} })),
  deleteTask: jest.fn(() => Promise.resolve({ data: {} })),
  getTaskById: jest.fn(() => Promise.resolve({ data: {} })),
}));

test('renders login form when user is not authenticated', () => {
  render(<App />);
  
  // Should show login form since no user is authenticated
  expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

test('renders task manager when user is authenticated', () => {
  // Mock authenticated user
  const mockAuthService = require('./Service/AuthService');
  mockAuthService.getCurrentUser.mockReturnValue({
    username: 'testuser',
    token: 'mock-token'
  });

  render(<App />);
  
  // Should show task manager interface
  expect(screen.getByRole('heading', { name: /task manager/i })).toBeInTheDocument();
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  expect(screen.getByText(/testuser/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
});

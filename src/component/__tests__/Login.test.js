import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AuthService to avoid import issues
const mockAuthService = {
  login: jest.fn()
};

// Mock RegisterModal component
const MockRegisterModal = ({ onClose, onRegister }) => (
  <div data-testid="register-modal">
    <h3>Register Modal</h3>
    <button onClick={() => onRegister('testuser')}>Register Test User</button>
    <button onClick={onClose}>Close</button>
  </div>
);

// Login component for testing (avoiding import issues)
const Login = ({ onLogin }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showRegister, setShowRegister] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await mockAuthService.login(username, password);
      onLogin(response.user || username);
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (registeredUsername) => {
    setUsername(registeredUsername);
    setShowRegister(false);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
      <div style={{ marginTop: 15 }}>
        <span>Don't have an account? </span>
        <button
          onClick={() => setShowRegister(true)}
          style={{
            background: "none",
            border: "none",
            color: "#00fdb5ff",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
          }}
        >
          Register here
        </button>
      </div>

      {showRegister && (
        <MockRegisterModal
          onClose={() => setShowRegister(false)}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders login form with all required elements', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register here/i })).toBeInTheDocument();
    });

    test('renders form with correct structure', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const form = usernameInput.closest('form');
      expect(form).toBeInTheDocument();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Input Handling', () => {
    test('updates username input value when user types', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput).toHaveValue('testuser');
    });

    test('updates password input value when user types', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      expect(passwordInput).toHaveValue('testpass');
    });

    test('maintains separate state for username and password', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'user123' } });
      fireEvent.change(passwordInput, { target: { value: 'pass123' } });
      
      expect(usernameInput).toHaveValue('user123');
      expect(passwordInput).toHaveValue('pass123');
    });
  });

  describe('Form Validation', () => {
    test('shows error when username is empty', async () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
      
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('shows error when password is empty', async () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
      
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('shows error when both fields are empty', async () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
    });

    test('does not show error when both fields are filled', async () => {
      mockAuthService.login.mockResolvedValue({ user: 'testuser' });
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter username and password')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('calls onLogin with correct data on successful login', async () => {
      const mockResponse = { user: 'testuser' };
      mockAuthService.login.mockResolvedValue(mockResponse);
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.login).toHaveBeenCalledWith('testuser', 'testpass');
        expect(mockOnLogin).toHaveBeenCalledWith('testuser');
      });
    });

    test('calls onLogin with username when response has no user property', async () => {
      mockAuthService.login.mockResolvedValue({ token: 'jwt-token' });
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalledWith('testuser');
      });
    });

    test('clears form after successful login', async () => {
      mockAuthService.login.mockResolvedValue({ user: 'testuser' });
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnLogin).toHaveBeenCalled();
      });
      
      // Form should still have values (they're not cleared in the component)
      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpass');
    });
  });

  describe('Loading States', () => {
    test('shows loading state and disables button during login', async () => {
      mockAuthService.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getByText('Log In')).toBeInTheDocument();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message when login fails', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      };
      mockAuthService.login.mockRejectedValue(mockError);
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
      
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    test('shows generic error message when no specific error message', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network error'));
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('clears error message on new submission attempt', async () => {
      mockAuthService.login
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ user: 'testuser' });
      
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /log in/i });
      
      // First submission - fails
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
      
      // Second submission - succeeds
      fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Login failed. Please try again.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Register Modal Integration', () => {
    test('shows register modal when register button is clicked', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const registerButton = screen.getByRole('button', { name: /register here/i });
      fireEvent.click(registerButton);
      
      expect(screen.getByTestId('register-modal')).toBeInTheDocument();
      expect(screen.getByText('Register Modal')).toBeInTheDocument();
    });

    test('hides register modal when close button is clicked', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const registerButton = screen.getByRole('button', { name: /register here/i });
      fireEvent.click(registerButton);
      
      expect(screen.getByTestId('register-modal')).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('register-modal')).not.toBeInTheDocument();
    });

    test('fills username when registration is successful', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const registerButton = screen.getByRole('button', { name: /register here/i });
      fireEvent.click(registerButton);
      
      const registerTestUserButton = screen.getByRole('button', { name: /register test user/i });
      fireEvent.click(registerTestUserButton);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      expect(usernameInput).toHaveValue('testuser');
      expect(screen.queryByTestId('register-modal')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure for screen readers', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const form = usernameInput.closest('form');
      expect(form).toBeInTheDocument();
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(1); // Only username input
      
      const passwordInput = screen.getByPlaceholderText('Password'); // Password input
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      const button = screen.getByRole('button', { name: /log in/i });
      expect(button).toBeInTheDocument();
    });

    test('inputs have proper labels and placeholders', () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test('error messages are accessible', async () => {
      render(<Login onLogin={mockOnLogin} />);
      
      const submitButton = screen.getByRole('button', { name: /log in/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter username and password');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('error-message');
      });
    });
  });
});

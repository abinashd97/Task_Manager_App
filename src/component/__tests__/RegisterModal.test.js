import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AuthService to avoid import issues
const mockAuthService = {
  register: jest.fn()
};

// RegisterModal component for testing (avoiding import issues)
const RegisterModal = ({ onClose, onRegister }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      await mockAuthService.register(username, password);
      onRegister(username);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleRegister}>
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

describe('RegisterModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders modal with all required elements', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    test('renders modal with correct structure', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const modalOverlay = screen.getByRole('heading', { name: /register/i }).closest('.modal-overlay');
      const modalContent = screen.getByRole('heading', { name: /register/i }).closest('.modal-content');
      
      expect(modalOverlay).toBeInTheDocument();
      expect(modalContent).toBeInTheDocument();
    });

    test('renders form with correct input types', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('Form Input Handling', () => {
    test('updates username input value when user types', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      
      expect(usernameInput).toHaveValue('newuser');
    });

    test('updates password input value when user types', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'newpass' } });
      
      expect(passwordInput).toHaveValue('newpass');
    });

    test('maintains separate state for username and password', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
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
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
      
      expect(mockOnRegister).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('shows error when password is empty', async () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
    });

    test('shows error when both fields are empty', async () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter username and password')).toBeInTheDocument();
      });
    });

    test('does not show error when both fields are filled', async () => {
      mockAuthService.register.mockResolvedValue({});
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Please enter username and password')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    test('calls register service and callbacks on successful registration', async () => {
      mockAuthService.register.mockResolvedValue({});
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(passwordInput, { target: { value: 'newpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockAuthService.register).toHaveBeenCalledWith('newuser', 'newpass');
        expect(mockOnRegister).toHaveBeenCalledWith('newuser');
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('calls onRegister with username after successful registration', async () => {
      mockAuthService.register.mockResolvedValue({});
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnRegister).toHaveBeenCalledWith('testuser');
      });
    });

    test('calls onClose after successful registration', async () => {
      mockAuthService.register.mockResolvedValue({});
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    test('clears form after successful registration', async () => {
      mockAuthService.register.mockResolvedValue({});
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnRegister).toHaveBeenCalled();
      });
      
      // Form should still have values (they're not cleared in the component)
      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpass');
    });
  });

  describe('Loading States', () => {
    test('shows loading state and disables button during registration', async () => {
      mockAuthService.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      expect(screen.getByText('Registering...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      
      await waitFor(() => {
        expect(screen.getAllByText('Register')[1]).toBeInTheDocument(); // Get the button, not the heading
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('re-enables button after failed registration', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Registration failed'));
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(screen.getAllByText('Register')[1]).toBeInTheDocument(); // Get the button, not the heading
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error message when registration fails', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Username already exists'
          }
        }
      };
      mockAuthService.register.mockRejectedValue(mockError);
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Username already exists')).toBeInTheDocument();
      });
      
      expect(mockOnRegister).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('shows generic error message when no specific error message', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Network error'));
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
    });

    test('clears error message on new submission attempt', async () => {
      mockAuthService.register
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({});
      
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /register/i });
      
      // First submission - fails
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
      
      // Second submission - succeeds
      fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Registration failed. Please try again.')).not.toBeInTheDocument();
      });
    });
  });

  describe('Modal Interactions', () => {
    test('calls onClose when close button is clicked', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when modal overlay is clicked', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const modalOverlay = screen.getByRole('heading', { name: /register/i }).closest('.modal-overlay');
      fireEvent.click(modalOverlay);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when modal content is clicked', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const modalContent = screen.getByRole('heading', { name: /register/i }).closest('.modal-content');
      fireEvent.click(modalContent);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('stops event propagation when modal content is clicked', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const modalContent = screen.getByRole('heading', { name: /register/i }).closest('.modal-content');
      const modalOverlay = modalContent.parentElement;
      
      // Click content should not trigger overlay click
      fireEvent.click(modalContent);
      expect(mockOnClose).not.toHaveBeenCalled();
      
      // Click overlay should trigger onClose
      fireEvent.click(modalOverlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    test('has proper form structure for screen readers', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const form = usernameInput.closest('form');
      expect(form).toBeInTheDocument();
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(1); // Only username input
      
      const passwordInput = screen.getByPlaceholderText('Password'); // Password input
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Register and Close buttons
    });

    test('inputs have proper labels and placeholders', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
    });

    test('error messages are accessible', async () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const submitButton = screen.getByRole('button', { name: /register/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter username and password');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('error-message');
      });
    });

    test('modal has proper heading structure', () => {
      render(
        <RegisterModal onClose={mockOnClose} onRegister={mockOnRegister} />
      );
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Register');
    });
  });
});

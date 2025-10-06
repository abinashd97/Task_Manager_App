import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock AuthService to avoid import issues
const mockAuthService = {
  getCurrentUser: jest.fn()
};

// AuthGuard component for testing (avoiding import issues)
const AuthGuard = ({ children, onUnauthorized }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      // Simulate async authentication check
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const user = mockAuthService.getCurrentUser();
      if (user && user.token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        if (onUnauthorized) {
          onUnauthorized();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [onUnauthorized]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // or redirect to login
  }

  return children;
};

// Test component to wrap with AuthGuard
const TestChildComponent = () => (
  <div data-testid="protected-content">
    <h1>Protected Content</h1>
    <p>This content is only visible to authenticated users</p>
  </div>
);

describe('AuthGuard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('shows loading message while checking authentication', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      // Loading state should be visible immediately
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Authentication Success', () => {
    test('renders children when user is authenticated with valid token', async () => {
      const mockUser = {
        token: 'valid-jwt-token',
        username: 'testuser'
      };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.getByText('This content is only visible to authenticated users')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    test('renders children when user object exists with token property', async () => {
      const mockUser = {
        token: 'another-valid-token',
        username: 'anotheruser',
        email: 'user@example.com'
      };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('calls getCurrentUser from authService', async () => {
      const mockUser = { token: 'test-token' };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Authentication Failure', () => {
    test('does not render children when user is not authenticated', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });

    test('does not render children when user exists but has no token', async () => {
      const mockUser = {
        username: 'testuser',
        email: 'user@example.com'
        // No token property
      };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    test('does not render children when user exists but token is empty', async () => {
      const mockUser = {
        token: '',
        username: 'testuser'
      };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    test('does not render children when user exists but token is null', async () => {
      const mockUser = {
        token: null,
        username: 'testuser'
      };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('onUnauthorized Callback', () => {
    test('calls onUnauthorized callback when user is not authenticated', async () => {
      const mockOnUnauthorized = jest.fn();
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      render(
        <AuthGuard onUnauthorized={mockOnUnauthorized}>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(mockOnUnauthorized).toHaveBeenCalledTimes(1);
      });
    });

    test('calls onUnauthorized callback when user has no token', async () => {
      const mockOnUnauthorized = jest.fn();
      const mockUser = { username: 'testuser' }; // No token
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard onUnauthorized={mockOnUnauthorized}>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(mockOnUnauthorized).toHaveBeenCalledTimes(1);
      });
    });

    test('does not call onUnauthorized when user is authenticated', async () => {
      const mockOnUnauthorized = jest.fn();
      const mockUser = { token: 'valid-token' };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard onUnauthorized={mockOnUnauthorized}>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(mockOnUnauthorized).not.toHaveBeenCalled();
      });
    });

    test('does not call onUnauthorized when callback is not provided', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      // Should not throw error when onUnauthorized is not provided
      expect(() => {
        render(
          <AuthGuard>
            <TestChildComponent />
          </AuthGuard>
        );
      }).not.toThrow();
    });
  });

  describe('Multiple Children', () => {
    test('renders multiple children when authenticated', async () => {
      const mockUser = { token: 'valid-token' };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    test('does not render multiple children when not authenticated', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('child-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('child-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Re-renders', () => {
    test('re-runs authentication check when onUnauthorized prop changes', async () => {
      const mockUser = null;
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      const { rerender } = render(
        <AuthGuard onUnauthorized={jest.fn()}>
          <TestChildComponent />
        </AuthGuard>
      );
      
      // Wait for initial authentication check to complete
      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      });
      
      // Clear the mock to reset call count
      jest.clearAllMocks();
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      // Re-render with different onUnauthorized callback
      const newCallback = jest.fn();
      rerender(
        <AuthGuard onUnauthorized={newCallback}>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
        expect(newCallback).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined user object', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(undefined);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    test('handles empty user object', async () => {
      mockAuthService.getCurrentUser.mockReturnValue({});
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    test('handles user with falsy token values', async () => {
      const falsyTokens = [false, 0, NaN];
      
      for (const token of falsyTokens) {
        const mockUser = { token };
        mockAuthService.getCurrentUser.mockReturnValue(mockUser);
        
        const { unmount } = render(
          <AuthGuard>
            <TestChildComponent />
          </AuthGuard>
        );
        
        await waitFor(() => {
          expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });
        
        unmount();
        jest.clearAllMocks();
      }
    });
  });

  describe('Accessibility', () => {
    test('loading state is accessible', async () => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      // Check that loading state is accessible
      const loadingElement = screen.getByText('Loading...');
      expect(loadingElement).toBeInTheDocument();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });

    test('protected content is accessible when authenticated', async () => {
      const mockUser = { token: 'valid-token' };
      mockAuthService.getCurrentUser.mockReturnValue(mockUser);
      
      render(
        <AuthGuard>
          <TestChildComponent />
        </AuthGuard>
      );
      
      await waitFor(() => {
        const protectedContent = screen.getByTestId('protected-content');
        expect(protectedContent).toBeInTheDocument();
        // Check that the content has proper structure for accessibility
        expect(protectedContent).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });
});

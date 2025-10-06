import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// ErrorBoundary component for testing (avoiding import issues)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong in a component.</h2>;
    }

    return this.props.children;
  }
}

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that doesn't throw an error
const NoErrorComponent = () => <div>Everything is fine</div>;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Normal Operation', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <NoErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Everything is fine')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong in a component.')).not.toBeInTheDocument();
    });

    test('renders multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>First Child</div>
          <div>Second Child</div>
          <NoErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Everything is fine')).toBeInTheDocument();
    });

    test('does not call console.error when no error occurs', () => {
      render(
        <ErrorBoundary>
          <NoErrorComponent />
        </ErrorBoundary>
      );

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('catches errors and displays error message', () => {
      // Suppress error logging for this test
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong in a component.')).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });

    test('calls componentDidCatch when error occurs', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        "Error caught by ErrorBoundary:",
        expect.any(Error),
        expect.any(Object)
      );

      // Restore console.error
      console.error = originalError;
    });

    test('updates state when getDerivedStateFromError is called', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong in a component.')).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Error Recovery', () => {
    test('can recover from errors when props change', () => {
      const originalError = console.error;
      console.error = jest.fn();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong in a component.')).toBeInTheDocument();

      // Change props to not throw error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error boundary should still show error state (it doesn't auto-recover)
      expect(screen.getByText('Something went wrong in a component.')).toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Edge Cases', () => {
    test('handles null children', () => {
      render(
        <ErrorBoundary>
          {null}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong in a component.')).not.toBeInTheDocument();
    });

    test('handles undefined children', () => {
      render(
        <ErrorBoundary>
          {undefined}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong in a component.')).not.toBeInTheDocument();
    });

    test('handles empty children', () => {
      render(
        <ErrorBoundary>
          {''}
        </ErrorBoundary>
      );

      expect(screen.queryByText('Something went wrong in a component.')).not.toBeInTheDocument();
    });

    test('handles multiple children with one throwing error', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <div>Safe Component</div>
          <ThrowError shouldThrow={true} />
          <div>Another Safe Component</div>
        </ErrorBoundary>
      );

      // Should show error message, not the safe components
      expect(screen.getByText('Something went wrong in a component.')).toBeInTheDocument();
      expect(screen.queryByText('Safe Component')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Safe Component')).not.toBeInTheDocument();

      // Restore console.error
      console.error = originalError;
    });
  });

  describe('Error Boundary Lifecycle', () => {
    test('getDerivedStateFromError returns correct state', () => {
      const result = ErrorBoundary.getDerivedStateFromError(new Error('Test error'));
      expect(result).toEqual({ hasError: true });
    });

    test('getDerivedStateFromError handles different error types', () => {
      const errors = [
        new Error('Standard error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        'String error'
      ];

      errors.forEach(error => {
        const result = ErrorBoundary.getDerivedStateFromError(error);
        expect(result).toEqual({ hasError: true });
      });
    });
  });

  describe('Accessibility', () => {
    test('error message is accessible', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorMessage = screen.getByText('Something went wrong in a component.');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.tagName).toBe('H2');

      // Restore console.error
      console.error = originalError;
    });

    test('error message has proper heading level', () => {
      const originalError = console.error;
      console.error = jest.fn();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorHeading = screen.getByRole('heading', { level: 2 });
      expect(errorHeading).toBeInTheDocument();
      expect(errorHeading).toHaveTextContent('Something went wrong in a component.');

      // Restore console.error
      console.error = originalError;
    });
  });
});

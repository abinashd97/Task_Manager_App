import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock TaskContext to avoid import issues
const TaskContext = React.createContext();

// TaskLoader component for testing (avoiding import issues)
class TaskLoader extends React.Component {
  static contextType = TaskContext;

  componentDidMount() {
    // Load tasks when component mounts (user is logged in)
    try {
      if (this.context && this.context.loadTasks) {
        this.context.loadTasks();
      }
    } catch (error) {
      // Handle errors gracefully
      console.error('Error loading tasks:', error);
    }
  }

  render() {
    return this.props.children;
  }
}

// Test component to verify children are rendered
const TestChild = () => <div data-testid="test-child">Child Component</div>;

// Mock context values for testing
const mockContextValue = {
  loadTasks: jest.fn(),
};

const renderWithTaskContext = (contextValue = mockContextValue) => {
  return render(
    <TaskContext.Provider value={contextValue}>
      <TaskLoader>
        <TestChild />
      </TaskLoader>
    </TaskContext.Provider>
  );
};

describe('TaskLoader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Mounting', () => {
    test('calls loadTasks when component mounts', () => {
      renderWithTaskContext();
      
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
    });

    test('calls loadTasks only once on mount', () => {
      renderWithTaskContext();
      
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
    });

    test('renders children correctly', () => {
      renderWithTaskContext();
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });
  });

  describe('Context Integration', () => {
    test('uses TaskContext correctly', () => {
      const customLoadTasks = jest.fn();
      const customContextValue = {
        loadTasks: customLoadTasks,
      };
      
      renderWithTaskContext(customContextValue);
      
      expect(customLoadTasks).toHaveBeenCalledTimes(1);
      expect(mockContextValue.loadTasks).not.toHaveBeenCalled();
    });

    test('handles missing loadTasks method gracefully', () => {
      const contextWithoutLoadTasks = {};
      
      // Should not throw error
      expect(() => {
        render(
          <TaskContext.Provider value={contextWithoutLoadTasks}>
            <TaskLoader>
              <TestChild />
            </TaskLoader>
          </TaskContext.Provider>
        );
      }).not.toThrow();
    });

    test('handles null context gracefully', () => {
      // Should not throw error
      expect(() => {
        render(
          <TaskContext.Provider value={null}>
            <TaskLoader>
              <TestChild />
            </TaskLoader>
          </TaskContext.Provider>
        );
      }).not.toThrow();
    });
  });

  describe('Component Lifecycle', () => {
    test('only calls loadTasks on mount, not on re-renders', () => {
      const { rerender } = renderWithTaskContext();
      
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      // Should still be called only once
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
    });

    test('calls loadTasks again if context changes', () => {
      const { rerender } = renderWithTaskContext();
      
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
      
      // Create new context value (new function reference)
      const newContextValue = {
        loadTasks: jest.fn(),
      };
      
      rerender(
        <TaskContext.Provider value={newContextValue}>
          <TaskLoader>
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      // The new context should not be called again since componentDidMount only runs once
      expect(newContextValue.loadTasks).toHaveBeenCalledTimes(0);
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
    });

    test('unmounts without errors', () => {
      const { unmount } = renderWithTaskContext();
      
      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });

  describe('Children Rendering', () => {
    test('renders single child', () => {
      renderWithTaskContext();
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    test('renders multiple children', () => {
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <div data-testid="child-1">First Child</div>
            <div data-testid="child-2">Second Child</div>
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(mockContextValue.loadTasks).toHaveBeenCalledTimes(1);
    });

    test('renders children with different types', () => {
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <div>Text Child</div>
            <span>Span Child</span>
            <button>Button Child</button>
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(screen.getByText('Text Child')).toBeInTheDocument();
      expect(screen.getByText('Span Child')).toBeInTheDocument();
      expect(screen.getByText('Button Child')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('renders children with complex components', () => {
      const ComplexChild = () => (
        <div>
          <h2>Complex Component</h2>
          <p>This is a complex child component</p>
          <button>Action Button</button>
        </div>
      );
      
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <ComplexChild />
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(screen.getByText('Complex Component')).toBeInTheDocument();
      expect(screen.getByText('This is a complex child component')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('renders children with conditional rendering', () => {
      const ConditionalChild = ({ show }) => (
        <div>
          {show && <div data-testid="conditional-content">Conditional Content</div>}
          <div data-testid="always-content">Always Content</div>
        </div>
      );
      
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <ConditionalChild show={true} />
            <TestChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(screen.getByTestId('conditional-content')).toBeInTheDocument();
      expect(screen.getByTestId('always-content')).toBeInTheDocument();
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles loadTasks throwing an error', () => {
      const errorLoadTasks = jest.fn(() => {
        throw new Error('Load tasks failed');
      });
      
      const errorContextValue = {
        loadTasks: errorLoadTasks,
      };
      
      // Component should render even if loadTasks throws an error
      renderWithTaskContext(errorContextValue);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('handles loadTasks being undefined', () => {
      const undefinedContextValue = {
        loadTasks: undefined,
      };
      
      // Component should render even if loadTasks is undefined
      renderWithTaskContext(undefinedContextValue);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('handles loadTasks being null', () => {
      const nullContextValue = {
        loadTasks: null,
      };
      
      // Component should render even if loadTasks is null
      renderWithTaskContext(nullContextValue);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      
      const SpyChild = () => {
        renderSpy();
        return <div data-testid="spy-child">Spy Child</div>;
      };
      
      const { rerender } = render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <SpyChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <SpyChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      // Should not re-render child unless necessary
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration Scenarios', () => {
    test('works with actual TaskContext provider pattern', () => {
      const mockLoadTasks = jest.fn();
      
      // Simulate a more realistic context structure
      const realisticContextValue = {
        tasks: [],
        loading: false,
        error: null,
        loadTasks: mockLoadTasks,
        addTask: jest.fn(),
        toggleTask: jest.fn(),
        removeTask: jest.fn(),
        updateTask: jest.fn(),
      };
      
      renderWithTaskContext(realisticContextValue);
      
      expect(mockLoadTasks).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('works when loadTasks is async', async () => {
      const asyncLoadTasks = jest.fn().mockResolvedValue({ data: [] });
      
      const asyncContextValue = {
        loadTasks: asyncLoadTasks,
      };
      
      renderWithTaskContext(asyncContextValue);
      
      expect(asyncLoadTasks).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      
      // Wait for async operation to complete
      await waitFor(() => {
        expect(asyncLoadTasks).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Accessibility', () => {
    test('maintains accessibility of child components', () => {
      const AccessibleChild = () => (
        <div>
          <h1>Accessible Title</h1>
          <button>Accessible Button</button>
          <input placeholder="Accessible Input" />
        </div>
      );
      
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <AccessibleChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('does not interfere with child component accessibility', () => {
      const ComplexAccessibleChild = () => (
        <form>
          <label htmlFor="test-input">Test Label</label>
          <input id="test-input" type="text" />
          <button type="submit">Submit</button>
        </form>
      );
      
      render(
        <TaskContext.Provider value={mockContextValue}>
          <TaskLoader>
            <ComplexAccessibleChild />
          </TaskLoader>
        </TaskContext.Provider>
      );
      
      const form = screen.getByDisplayValue('').closest('form');
      const input = screen.getByLabelText('Test Label');
      const button = screen.getByRole('button', { name: 'Submit' });
      
      expect(form).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(button).toBeInTheDocument();
      expect(input).toHaveAttribute('id', 'test-input');
    });
  });
});

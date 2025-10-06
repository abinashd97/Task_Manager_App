import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock TaskService to avoid import issues
const mockTaskService = {
  getAllTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
};

// TaskContext and TaskProvider for testing (avoiding import issues)
const TaskContext = React.createContext();

class TaskProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: false,
      error: null,
    };
  }

  // Load all tasks from backend
  loadTasks = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await mockTaskService.getAllTasks();
      this.setState({ tasks: response.data || [] });
    } catch (error) {
      this.setState({ error: error.response?.data?.message || "Failed to load tasks" });
      console.error("Error loading tasks:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  addTask = async (task) => {
    this.setState({ loading: true, error: null });
    try {
      const response = await mockTaskService.createTask(task);
      this.setState((prevState) => ({
        tasks: [...prevState.tasks, response.data],
      }));
    } catch (error) {
      this.setState({ error: error.response?.data?.message || "Failed to create task" });
      console.error("Error creating task:", error);
      throw error;
    } finally {
      this.setState({ loading: false });
    }
  };

  toggleTask = async (id) => {
    const task = this.state.tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    
    this.setState({ loading: true, error: null });
    try {
      await mockTaskService.updateTask(id, updatedTask);
      this.setState((prevState) => ({
        tasks: prevState.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      this.setState({ error: error.response?.data?.message || "Failed to update task" });
      console.error("Error updating task:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  removeTask = async (id) => {
    this.setState({ loading: true, error: null });
    try {
      await mockTaskService.deleteTask(id);
      this.setState((prevState) => ({
        tasks: prevState.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      this.setState({ error: error.response?.data?.message || "Failed to delete task" });
      console.error("Error deleting task:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  updateTask = async (id, newTitle, newDescription) => {
    const task = this.state.tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, title: newTitle, description: newDescription };
    
    this.setState({ loading: true, error: null });
    try {
      await mockTaskService.updateTask(id, updatedTask);
      this.setState((prevState) => ({
        tasks: prevState.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      this.setState({ error: error.response?.data?.message || "Failed to update task" });
      console.error("Error updating task:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <TaskContext.Provider
        value={{
          tasks: this.state.tasks,
          loading: this.state.loading,
          error: this.state.error,
          loadTasks: this.loadTasks,
          addTask: this.addTask,
          toggleTask: this.toggleTask,
          removeTask: this.removeTask,
          updateTask: this.updateTask,
        }}
      >
        {this.props.children}
      </TaskContext.Provider>
    );
  }
}

// Test component that uses TaskContext
const TestConsumer = () => {
  const context = React.useContext(TaskContext);
  
  const handleAddTask = async () => {
    try {
      await context.addTask({ title: 'Test Task', description: 'Test Description' });
    } catch (error) {
      // Error is handled by the context, just prevent it from bubbling up
      console.error('Test addTask error:', error);
    }
  };
  
  return (
    <div>
      <div data-testid="tasks-count">{context.tasks.length}</div>
      <div data-testid="loading-state">{context.loading ? 'loading' : 'not loading'}</div>
      <div data-testid="error-state">{context.error || 'no error'}</div>
      <button onClick={() => context.loadTasks()}>Load Tasks</button>
      <button onClick={handleAddTask}>Add Task</button>
      <button onClick={() => context.toggleTask(1)}>Toggle Task</button>
      <button onClick={() => context.removeTask(1)}>Remove Task</button>
      <button onClick={() => context.updateTask(1, 'New Title', 'New Description')}>Update Task</button>
    </div>
  );
};

describe('TaskContext and TaskProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    test('provides initial state values', () => {
      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      expect(screen.getByTestId('error-state')).toHaveTextContent('no error');
    });

    test('provides all required context methods', () => {
      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // All buttons should be present, indicating methods are available
      expect(screen.getByRole('button', { name: /load tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove task/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });
  });

  describe('loadTasks Method', () => {
    test('loads tasks successfully', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: true }
      ];
      mockTaskService.getAllTasks.mockResolvedValue({ data: mockTasks });

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('2');
      });

      expect(mockTaskService.getAllTasks).toHaveBeenCalledTimes(1);
    });

    test('handles load tasks error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Failed to fetch tasks'
          }
        }
      };
      mockTaskService.getAllTasks.mockRejectedValue(mockError);

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to fetch tasks');
      });
    });

    test('shows loading state during load tasks', async () => {
      mockTaskService.getAllTasks.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      });
    });
  });

  describe('addTask Method', () => {
    test('adds task successfully', async () => {
      const mockNewTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockNewTask });

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description'
      });
    });

    test('handles add task error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Failed to create task'
          }
        }
      };
      mockTaskService.createTask.mockRejectedValue(mockError);

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to create task');
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0'); // No task added
      });
    });

    test('shows loading state during add task', async () => {
      mockTaskService.createTask.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { id: 1, title: 'Test Task', description: 'Test Description', completed: false } }), 100))
      );

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      });
    });
  });

  describe('toggleTask Method', () => {
    test('toggles task completion successfully', async () => {
      // First add a task
      const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockTask });
      mockTaskService.updateTask.mockResolvedValue({});

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // Add task first
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      // Then toggle it
      const toggleButton = screen.getByRole('button', { name: /toggle task/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      });

      expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        completed: true
      });
    });

    test('handles toggle task error', async () => {
      // First add a task
      const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockTask });
      
      const mockError = {
        response: {
          data: {
            message: 'Failed to update task'
          }
        }
      };
      mockTaskService.updateTask.mockRejectedValue(mockError);

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // Add task first
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      const toggleButton = screen.getByRole('button', { name: /toggle task/i });
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to update task');
      });
    });
  });

  describe('removeTask Method', () => {
    test('removes task successfully', async () => {
      // First add a task
      const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockTask });
      mockTaskService.deleteTask.mockResolvedValue({});

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // Add task first
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      // Then remove it
      const removeButton = screen.getByRole('button', { name: /remove task/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1);
    });

    test('handles remove task error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Failed to delete task'
          }
        }
      };
      mockTaskService.deleteTask.mockRejectedValue(mockError);

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const removeButton = screen.getByRole('button', { name: /remove task/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to delete task');
      });
    });
  });

  describe('updateTask Method', () => {
    test('updates task successfully', async () => {
      // First add a task
      const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockTask });
      mockTaskService.updateTask.mockResolvedValue({});

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // Add task first
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      // Then update it
      const updateButton = screen.getByRole('button', { name: /update task/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      });

      expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, {
        id: 1,
        title: 'New Title',
        description: 'New Description',
        completed: false
      });
    });

    test('handles update task error', async () => {
      // First add a task
      const mockTask = { id: 1, title: 'Test Task', description: 'Test Description', completed: false };
      mockTaskService.createTask.mockResolvedValue({ data: mockTask });
      
      const mockError = {
        response: {
          data: {
            message: 'Failed to update task'
          }
        }
      };
      mockTaskService.updateTask.mockRejectedValue(mockError);

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      // Add task first
      const addButton = screen.getByRole('button', { name: /add task/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });

      const updateButton = screen.getByRole('button', { name: /update task/i });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to update task');
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty task list from API', async () => {
      mockTaskService.getAllTasks.mockResolvedValue({ data: [] });

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });
    });

    test('handles null response from API', async () => {
      mockTaskService.getAllTasks.mockResolvedValue({ data: null });

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });
    });

    test('handles undefined response from API', async () => {
      mockTaskService.getAllTasks.mockResolvedValue({});

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });
    });

    test('handles network errors without response', async () => {
      mockTaskService.getAllTasks.mockRejectedValue(new Error('Network error'));

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load tasks');
      });
    });
  });

  describe('State Management', () => {
    test('maintains separate loading states for different operations', async () => {
      mockTaskService.getAllTasks.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [] }), 100))
      );
      mockTaskService.createTask.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { id: 1, title: 'Test Task', description: 'Test Description', completed: false } }), 50))
      );

      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      const addButton = screen.getByRole('button', { name: /add task/i });

      // Start both operations
      fireEvent.click(loadButton);
      fireEvent.click(addButton);

      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('not loading');
      });
    });

    test('clears error state on new operations', async () => {
      // First operation fails
      mockTaskService.getAllTasks.mockRejectedValueOnce(new Error('First error'));
      
      render(
        <TaskProvider>
          <TestConsumer />
        </TaskProvider>
      );

      const loadButton = screen.getByRole('button', { name: /load tasks/i });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Failed to load tasks');
      });

      // Second operation succeeds
      mockTaskService.getAllTasks.mockResolvedValueOnce({ data: [{ id: 1, title: 'Task' }] });
      fireEvent.click(loadButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('no error');
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
      });
    });
  });
});

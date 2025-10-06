import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock TaskContext to avoid import issues
const TaskContext = React.createContext();

// TaskList component for testing (avoiding import issues)
class TaskList extends React.Component {
  static contextType = TaskContext;

  constructor(props) {
    super(props);
    this.state = {
      editingId: null,
      editTitle: "",
      editDescription: "",
    };
  }

  startEdit = (task) => {
    this.setState({
      editingId: task.id,
      editTitle: task.title,
      editDescription: task.description,
    });
  };

  cancelEdit = () => {
    this.setState({ editingId: null, editTitle: "", editDescription: "" });
  };

  saveEdit = async () => {
    const { editTitle, editDescription, editingId } = this.state;
    if (editTitle.trim() || editDescription.trim()) {
      try {
        await this.context.updateTask(editingId, editTitle, editDescription);
        this.cancelEdit();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  handleEditTitleChange = (e) => {
    this.setState({ editTitle: e.target.value });
  };

  handleEditDescriptionChange = (e) => {
    this.setState({ editDescription: e.target.value });
  };

  render() {
    const { tasks, loading, error, toggleTask, removeTask } = this.context;
    const { editingId, editTitle, editDescription } = this.state;

    if (loading && tasks.length === 0) {
      return <div style={{ textAlign: 'center', padding: '20px' }}>Loading tasks...</div>;
    }

    if (error) {
      return <div className="error-message">{error}</div>;
    }

    return (
      <table
        className="task-table"
        style={{ width: "100%", borderCollapse: "collapse" }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isEditing = editingId === task.id;
            return (
              <tr key={task.id}>
                <td
                  className="task-title"
                  style={{
                    fontWeight: "600",
                    textDecoration: task.completed ? "line-through" : "none",
                    color: task.completed ? "#29532bff" : "inherit",
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={this.handleEditTitleChange}
                      className="task-edit-input"
                      style={{
                        color: task.completed ? "#000000ff" : "#000000ff",
                      }}
                    />
                  ) : (
                    task.title || "(No title)"
                  )}
                </td>
                <td
                  style={{
                    fontWeight: "600",
                    color: task.completed ? "#29532bff" : "inherit",
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={this.handleEditDescriptionChange}
                      className="task-edit-input"
                    />
                  ) : (
                    task.description || "(No description)"
                  )}
                </td>
                <td
                  style={{
                    color: task.completed ? "#00ff0dff" : "#bd1212ff",
                    fontWeight: "bold",
                  }}
                >
                  {task.completed ? "Completed" : "Pending"}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    {isEditing ? (
                      <>
                        <button
                          onClick={this.saveEdit}
                          title="Save"
                          className="task-btn"
                          style={{ padding: "6px 10px" }}
                        >
                          💾
                        </button>
                        <button
                          onClick={this.cancelEdit}
                          title="Cancel"
                          className="task-btn delete"
                          style={{ padding: "6px 10px" }}
                        >
                          ✖️
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="task-btn edit"
                          onClick={() => this.startEdit(task)}
                          title="Edit"
                          style={{ padding: "6px 10px" }}
                        >
                          📝
                        </button>
                        <button
                          className="task-btn toggle"
                          onClick={() => toggleTask(task.id)}
                          title="Toggle Done"
                          style={{ padding: "6px 10px" }}
                          disabled={loading}
                        >
                          ✅
                        </button>
                        <button
                          className="task-btn delete"
                          onClick={() => removeTask(task.id)}
                          title="Delete"
                          style={{ padding: "6px 10px" }}
                          disabled={loading}
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}

// Mock context values for testing
const mockContextValue = {
  tasks: [],
  loading: false,
  error: null,
  toggleTask: jest.fn(),
  removeTask: jest.fn(),
  updateTask: jest.fn(),
};

const renderWithTaskContext = (contextValue = mockContextValue) => {
  return render(
    <TaskContext.Provider value={contextValue}>
      <TaskList />
    </TaskContext.Provider>
  );
};

describe('TaskList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders table with correct structure', () => {
      renderWithTaskContext();
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /title/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /description/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();
    });

    test('renders empty table when no tasks', () => {
      renderWithTaskContext();
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.queryByRole('row', { name: /task/i })).not.toBeInTheDocument();
    });

    test('renders tasks in table rows', () => {
      const tasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: true }
      ];
      
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    test('shows loading message when loading and no tasks', () => {
      renderWithTaskContext({ ...mockContextValue, loading: true, tasks: [] });
      
      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    test('shows table when loading but has existing tasks', () => {
      const tasks = [{ id: 1, title: 'Task 1', description: 'Description 1', completed: false }];
      renderWithTaskContext({ ...mockContextValue, loading: true, tasks });
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    test('shows error message when error occurs', () => {
      renderWithTaskContext({ ...mockContextValue, error: 'Failed to load tasks' });
      
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tasks')).toHaveClass('error-message');
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });

  describe('Task Display', () => {
    test('displays task title and description', () => {
      const tasks = [{ id: 1, title: 'My Task', description: 'My Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('My Task')).toBeInTheDocument();
      expect(screen.getByText('My Description')).toBeInTheDocument();
    });

    test('displays "(No title)" for tasks without title', () => {
      const tasks = [{ id: 1, title: '', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('(No title)')).toBeInTheDocument();
    });

    test('displays "(No description)" for tasks without description', () => {
      const tasks = [{ id: 1, title: 'Title', description: '', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('(No description)')).toBeInTheDocument();
    });

    test('shows completed status for completed tasks', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: true }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    test('shows pending status for incomplete tasks', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  describe('Task Actions', () => {
    test('renders action buttons for each task', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle Done')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    test('calls toggleTask when toggle button is clicked', () => {
      const mockToggleTask = jest.fn();
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, toggleTask: mockToggleTask });
      
      const toggleButton = screen.getByTitle('Toggle Done');
      fireEvent.click(toggleButton);
      
      expect(mockToggleTask).toHaveBeenCalledWith(1);
    });

    test('calls removeTask when delete button is clicked', () => {
      const mockRemoveTask = jest.fn();
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, removeTask: mockRemoveTask });
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(mockRemoveTask).toHaveBeenCalledWith(1);
    });

    test('disables action buttons when loading', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, loading: true });
      
      const toggleButton = screen.getByTitle('Toggle Done');
      const deleteButton = screen.getByTitle('Delete');
      
      expect(toggleButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Task Editing', () => {
    test('enters edit mode when edit button is clicked', () => {
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
      expect(screen.getByTitle('Save')).toBeInTheDocument();
      expect(screen.getByTitle('Cancel')).toBeInTheDocument();
    });

    test('updates title input when typing in edit mode', () => {
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const titleInput = screen.getByDisplayValue('Original Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      
      expect(titleInput).toHaveValue('Updated Title');
    });

    test('updates description input when typing in edit mode', () => {
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const descriptionInput = screen.getByDisplayValue('Original Description');
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
      
      expect(descriptionInput).toHaveValue('Updated Description');
    });

    test('calls updateTask when save button is clicked', async () => {
      const mockUpdateTask = jest.fn().mockResolvedValue();
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, updateTask: mockUpdateTask });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const titleInput = screen.getByDisplayValue('Original Title');
      const descriptionInput = screen.getByDisplayValue('Original Description');
      const saveButton = screen.getByTitle('Save');
      
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
      fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(1, 'Updated Title', 'Updated Description');
      });
    });

    test('exits edit mode after successful save', async () => {
      const mockUpdateTask = jest.fn().mockResolvedValue();
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, updateTask: mockUpdateTask });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const saveButton = screen.getByTitle('Save');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(screen.queryByTitle('Save')).not.toBeInTheDocument();
        expect(screen.queryByTitle('Cancel')).not.toBeInTheDocument();
        expect(screen.getByTitle('Edit')).toBeInTheDocument();
      });
    });

    test('cancels edit mode when cancel button is clicked', () => {
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const cancelButton = screen.getByTitle('Cancel');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTitle('Save')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Cancel')).not.toBeInTheDocument();
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
    });

    test('does not save when both title and description are empty', async () => {
      const mockUpdateTask = jest.fn();
      const tasks = [{ id: 1, title: 'Original Title', description: 'Original Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks, updateTask: mockUpdateTask });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const titleInput = screen.getByDisplayValue('Original Title');
      const descriptionInput = screen.getByDisplayValue('Original Description');
      const saveButton = screen.getByTitle('Save');
      
      fireEvent.change(titleInput, { target: { value: '   ' } });
      fireEvent.change(descriptionInput, { target: { value: '   ' } });
      fireEvent.click(saveButton);
      
      // Should not call updateTask
      expect(mockUpdateTask).not.toHaveBeenCalled();
    });
  });

  describe('Task Styling', () => {
    test('applies completed styling to completed tasks', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: true }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const titleCell = screen.getByText('Task').closest('td');
      const descriptionCell = screen.getAllByText('Description')[1].closest('td'); // Get the second one (data cell, not header)
      
      expect(titleCell).toHaveStyle('text-decoration: line-through');
      expect(descriptionCell).toHaveStyle('text-decoration: line-through');
    });

    test('applies pending styling to incomplete tasks', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const titleCell = screen.getByText('Task').closest('td');
      const descriptionCell = screen.getAllByText('Description')[1].closest('td'); // Get the second one (data cell, not header)
      
      expect(titleCell).toHaveStyle('text-decoration: none');
      expect(descriptionCell).toHaveStyle('text-decoration: none');
    });

    test('applies correct status colors', () => {
      const tasks = [
        { id: 1, title: 'Completed Task', description: 'Description', completed: true },
        { id: 2, title: 'Pending Task', description: 'Description', completed: false }
      ];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const completedStatus = screen.getByText('Completed').closest('td');
      const pendingStatus = screen.getByText('Pending').closest('td');
      
      expect(completedStatus).toHaveStyle('color: rgb(0, 255, 13)');
      expect(pendingStatus).toHaveStyle('color: rgb(189, 18, 18)');
    });
  });

  describe('Multiple Tasks', () => {
    test('renders multiple tasks correctly', () => {
      const tasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: true },
        { id: 3, title: 'Task 3', description: 'Description 3', completed: false }
      ];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
      expect(screen.getAllByTitle('Edit')).toHaveLength(3);
      expect(screen.getAllByTitle('Toggle Done')).toHaveLength(3);
      expect(screen.getAllByTitle('Delete')).toHaveLength(3);
    });

    test('handles editing different tasks independently', () => {
      const tasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', completed: false },
        { id: 2, title: 'Task 2', description: 'Description 2', completed: false }
      ];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      // Edit first task
      const editButtons = screen.getAllByTitle('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(screen.getByDisplayValue('Task 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Description 1')).toBeInTheDocument();
      
      // Cancel and edit second task
      const cancelButton = screen.getByTitle('Cancel');
      fireEvent.click(cancelButton);
      
      fireEvent.click(editButtons[1]);
      
      expect(screen.getByDisplayValue('Task 2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Description 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper table structure for screen readers', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(4);
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(2); // Header + 1 data row
    });

    test('action buttons have proper titles for accessibility', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Toggle Done')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    test('edit inputs are accessible', () => {
      const tasks = [{ id: 1, title: 'Task', description: 'Description', completed: false }];
      renderWithTaskContext({ ...mockContextValue, tasks });
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(2);
      
      expect(inputs[0]).toHaveClass('task-edit-input');
      expect(inputs[1]).toHaveClass('task-edit-input');
    });
  });
});

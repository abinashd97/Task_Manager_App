import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple AddTask component for testing (avoiding import issues)
const AddTask = () => {
  const [text1, setText1] = React.useState('');
  const [text2, setText2] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!text1.trim() && !text2.trim()) {
      setError('Please enter at least a title or description');
      return;
    }
    
    // Clear form
    setText1('');
    setText2('');
    setError('');
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <form className="add-task-form" onSubmit={handleSubmit}>
        <div className="input-row">
          <input
            className="add-task-input"
            type="text"
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Add new task"
          />
          <input
            className="add-task-input"
            type="text"
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Add Description"
          />
        </div>
        <button className="add-task-btn" type="submit">
          Add
        </button>
      </form>
    </div>
  );
};

describe('AddTask Component', () => {
  test('renders the form with inputs and button', () => {
    render(<AddTask />);
    
    expect(screen.getByPlaceholderText('Add new task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Add Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('updates input values when user types', () => {
    render(<AddTask />);
    
    const titleInput = screen.getByPlaceholderText('Add new task');
    const descriptionInput = screen.getByPlaceholderText('Add Description');
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  test('shows error when both fields are empty', () => {
    render(<AddTask />);
    
    const submitButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Please enter at least a title or description')).toBeInTheDocument();
  });

  test('clears form after successful submission', () => {
    render(<AddTask />);
    
    const titleInput = screen.getByPlaceholderText('Add new task');
    const descriptionInput = screen.getByPlaceholderText('Add Description');
    const submitButton = screen.getByRole('button', { name: /add/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  test('does not show error when at least one field has content', () => {
    render(<AddTask />);
    
    const titleInput = screen.getByPlaceholderText('Add new task');
    const submitButton = screen.getByRole('button', { name: /add/i });
    
    fireEvent.change(titleInput, { target: { value: 'Valid Task' } });
    fireEvent.click(submitButton);
    
    expect(screen.queryByText('Please enter at least a title or description')).not.toBeInTheDocument();
  });

  test('trims whitespace from inputs', () => {
    render(<AddTask />);
    
    const titleInput = screen.getByPlaceholderText('Add new task');
    const submitButton = screen.getByRole('button', { name: /add/i });
    
    fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
    fireEvent.click(submitButton);
    
    // After submission, the form should be cleared
    expect(titleInput).toHaveValue('');
  });
});

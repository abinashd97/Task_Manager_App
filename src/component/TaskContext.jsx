import React, { createContext, Component } from "react";
import taskService from "../Service/TaskService";

export const TaskContext = createContext();

class TaskProvider extends Component {
  state = {
    tasks: [],
    loading: false,
    error: null,
  };

  // Load all tasks from backend
  loadTasks = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await taskService.getAllTasks();
      this.setState({ tasks: response.data || [] });
    } catch (error) {
      this.setState({
        error: error.response?.data?.message || "Failed to load tasks",
      });
      console.error("Error loading tasks:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  addTask = async (task) => {
    this.setState({ loading: true, error: null });
    try {
      const response = await taskService.createTask(task);
      // Add the created task to the local state
      this.setState((prevState) => ({
        tasks: [...prevState.tasks, response.data],
      }));
    } catch (error) {
      this.setState({
        error: error.response?.data?.message || "Failed to create task",
      });
      console.error("Error creating task:", error);
      throw error; // Re-throw so the UI can handle it
    } finally {
      this.setState({ loading: false });
    }
  };

  toggleTask = async (id) => {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    this.setState({ loading: true, error: null });
    try {
      await taskService.updateTask(id, updatedTask);
      // Update local state
      this.setState((prevState) => ({
        tasks: prevState.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      this.setState({
        error: error.response?.data?.message || "Failed to update task",
      });
      console.error("Error updating task:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  removeTask = async (id) => {
    this.setState({ loading: true, error: null });
    try {
      await taskService.deleteTask(id);
      // Remove task from local state
      this.setState((prevState) => ({
        tasks: prevState.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      this.setState({
        error: error.response?.data?.message || "Failed to delete task",
      });
      console.error("Error deleting task:", error);
    } finally {
      this.setState({ loading: false });
    }
  };

  updateTask = async (id, newTitle, newDescription) => {
    const task = this.state.tasks.find((t) => t.id === id);
    if (!task) return;

    const updatedTask = {
      ...task,
      title: newTitle,
      description: newDescription,
    };

    this.setState({ loading: true, error: null });
    try {
      await taskService.updateTask(id, updatedTask);
      // Update local state
      this.setState((prevState) => ({
        tasks: prevState.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }));
    } catch (error) {
      this.setState({
        error: error.response?.data?.message || "Failed to update task",
      });
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

export default TaskProvider;

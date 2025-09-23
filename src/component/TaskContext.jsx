import React, { createContext, Component } from "react";

export const TaskContext = createContext();

class TaskProvider extends Component {
  state = {
    tasks: [],
  };

  addTask = (task) => {
    this.setState((prevState) => ({
      tasks: [...prevState.tasks, task],
    }));
  };

  toggleTask = (id) => {
    this.setState((prevState) => ({
      tasks: prevState.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  };

  removeTask = (id) => {
    this.setState((prevState) => ({
      tasks: prevState.tasks.filter((task) => task.id !== id),
    }));
  };

  updateTask = (id, newTitle, newDescription) => {
    this.setState((prevState) => ({
      tasks: prevState.tasks.map((task) =>
        task.id === id
          ? { ...task, title: newTitle, description: newDescription }
          : task
      ),
    }));
  };

  render() {
    return (
      <TaskContext.Provider
        value={{
          tasks: this.state.tasks,
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

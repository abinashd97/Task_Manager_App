import React, { createContext, Component } from "react";

const TaskContext = createContext();

class TaskProvider extends Component {
  state = {
    tasks: [
      { id: 1, text: "Learn React Context API", completed: false },
      { id: 2, text: "Build a Task Manager App", completed: false },
    ],
  };

  addTask = (text) => {
    const newTask = { id: Date.now(), text, completed: false };
    this.setState((prevState) => ({
      tasks: [...prevState.tasks, newTask],
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

  render() {
    return (
      <TaskContext.Provider
        value={{
          tasks: this.state.tasks,
          addTask: this.addTask,
          toggleTask: this.toggleTask,
          removeTask: this.removeTask,
        }}
      >
        {this.props.children}
      </TaskContext.Provider>
    );
  }
}

export { TaskProvider, TaskContext };

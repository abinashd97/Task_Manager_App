import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class TaskLoader extends Component {
  static contextType = TaskContext;

  componentDidMount() {
    // Load tasks when component mounts (user is logged in)
    this.context.loadTasks();
  }

  render() {
    return this.props.children;
  }
}

export default TaskLoader;
import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class AddTask extends Component {
  static contextType = TaskContext;

  state = { text: "" };

  handleChange = (e) => {
    this.setState({ text: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.text.trim()) {
      this.context.addTask(this.state.text);
      this.setState({ text: "" });
    }
  };

  render() {
    return (
      <form class="add-task-form" onSubmit={this.handleSubmit}>
        <input
          class="add-task-input"
          type="text"
          value={this.state.text}
          onChange={this.handleChange}
          placeholder="Add new task"
        />
        <button class="add-task-btn" type="submit">
          Add
        </button>
      </form>
    );
  }
}

export default AddTask;

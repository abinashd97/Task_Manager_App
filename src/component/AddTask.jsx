import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class AddTask extends Component {
  static contextType = TaskContext;

  state = { text1: "", text2: "" };

  handleChange1 = (e) => {
    this.setState({ text1: e.target.value });
  };

  handleChange2 = (e) => {
    this.setState({ text2: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { text1, text2 } = this.state;
    if (text1.trim() || text2.trim()) {
      this.context.addTask({
        id: Date.now(),
        title: text1,
        description: text2,
        completed: false,
      });
      this.setState({ text1: "", text2: "" });
    }
  };

  render() {
    return (
      <form className="add-task-form" onSubmit={this.handleSubmit}>
        <div
          className="input-row"
          style={{ display: "flex", gap: "14px", marginBottom: "14px" }}
        >
          <input
            className="add-task-input"
            type="text"
            value={this.state.text1}
            onChange={this.handleChange1}
            placeholder="Add new task"
          />
          <input
            className="add-task-input"
            type="text"
            value={this.state.text2}
            onChange={this.handleChange2}
            placeholder="Add Description"
          />
        </div>
        <button
          className="add-task-btn"
          type="submit"
          style={{ width: "100%" }}
        >
          Add
        </button>
      </form>
    );
  }
}

export default AddTask;

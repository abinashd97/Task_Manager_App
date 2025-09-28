import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class AddTask extends Component {
  static contextType = TaskContext;

  state = { text1: "", text2: "", loading: false, error: "" };

  handleChange1 = (e) => {
    this.setState({ text1: e.target.value });
  };

  handleChange2 = (e) => {
    this.setState({ text2: e.target.value });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { text1, text2 } = this.state;
    
    if (!text1.trim() && !text2.trim()) {
      this.setState({ error: "Please enter at least a title or description" });
      return;
    }

    this.setState({ loading: true, error: "" });
    
    try {
      await this.context.addTask({
        title: text1.trim(),
        description: text2.trim(),
        completed: false,
      });
      this.setState({ text1: "", text2: "", error: "" });
    } catch (error) {
      this.setState({ error: "Failed to create task. Please try again." });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, error } = this.state;
    
    return (
      <div>
        {error && <div className="error-message">{error}</div>}
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
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
        </form>
      </div>
    );
  }
}

export default AddTask;

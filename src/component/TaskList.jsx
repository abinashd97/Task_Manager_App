import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class TaskList extends Component {
  static contextType = TaskContext;

  state = {
    editingId: null,
    editTitle: "",
    editDescription: "",
  };

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

  saveEdit = () => {
    const { editTitle, editDescription, editingId } = this.state;
    if (editTitle.trim() || editDescription.trim()) {
      this.context.updateTask(editingId, editTitle, editDescription);
    }
    this.cancelEdit();
  };

  handleEditTitleChange = (e) => {
    this.setState({ editTitle: e.target.value });
  };

  handleEditDescriptionChange = (e) => {
    this.setState({ editDescription: e.target.value });
  };

  render() {
    const { tasks, toggleTask, removeTask } = this.context;
    const { editingId, editTitle, editDescription } = this.state;

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
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={this.handleEditTitleChange}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    task.title || "(No title)"
                  )}
                </td>
                <td
                  style={{
                    color: "#fdfdfdff",
                    textDecoration: task.completed ? "line-through" : "none",
                  }}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={editDescription}
                      onChange={this.handleEditDescriptionChange}
                      style={{ width: "100%" }}
                    />
                  ) : (
                    task.description || "(No description)"
                  )}
                </td>
                <td>{task.completed ? "Completed" : "Pending"}</td>
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
                        >
                          ✅
                        </button>
                        <button
                          className="task-btn delete"
                          onClick={() => removeTask(task.id)}
                          title="Delete"
                          style={{ padding: "6px 10px" }}
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

export default TaskList;

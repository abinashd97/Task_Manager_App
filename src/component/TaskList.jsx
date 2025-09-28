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

  saveEdit = async () => {
    const { editTitle, editDescription, editingId } = this.state;
    if (editTitle.trim() || editDescription.trim()) {
      try {
        await this.context.updateTask(editingId, editTitle, editDescription);
        this.cancelEdit();
      } catch (error) {
        console.error("Error updating task:", error);
        // Keep editing mode open on error
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
                {
                  /* <td
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
                      className="task-edit-input"
                    />
                  ) : (
                    task.title || "(No title)"
                  )}
                </td> */
                  <td
                    className="task-title"
                    style={{
                      fontWeight: "600",
                      textDecoration: task.completed ? "line-through" : "none",
                      color: task.completed ? "#29532bff" : "inherit",
                      // force override
                      // color: task.completed ? "#888888 !important" : "inherit",
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
                }
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
                    color: task.completed ? "#00ff0dff" : "#bd1212ff", // green for completed, red for pending
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

export default TaskList;

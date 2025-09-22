import React, { Component } from "react";
import { TaskContext } from "./TaskContext";

class TaskList extends Component {
  static contextType = TaskContext;

  componentDidMount() {
    console.log("TaskList mounted");
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("TaskList updated");
  }

  componentWillUnmount() {
    console.log("TaskList will unmount");
  }

  render() {
    const { tasks, toggleTask, removeTask } = this.context;

    return (
      // <ul>
      //   {tasks.map((task) => (
      //     <li
      //       key={task.id}
      //       style={{ textDecoration: task.completed ? "line-through" : "none" }}
      //     >
      //       {task.text}
      //       <button
      //         className="task-btn toggle"
      //         onClick={() => toggleTask(task.id)}
      //       >
      //         Toggle
      //       </button>
      //       <button
      //         className="task-btn delete"
      //         onClick={() => removeTask(task.id)}
      //       >
      //         Delete
      //       </button>
      //       <br />
      //     </li>
      //   ))}
      // </ul>
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{ textDecoration: task.completed ? "line-through" : "none" }}
          >
            <span className="task-text">{task.text}</span>
            <div className="task-actions">
              <button
                className="task-btn toggle"
                onClick={() => toggleTask(task.id)}
              >
                Toggle
              </button>
              <button
                className="task-btn delete"
                onClick={() => removeTask(task.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }
}

export default TaskList;

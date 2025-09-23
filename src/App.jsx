import React from "react";
import TaskProvider from "./component/TaskContext";
import ErrorBoundary from "./component/ErrorBoundary";
import TaskList from "./component/TaskList";
import AddTask from "./component/AddTask";
import "./App.css";

function App() {
  return (
    <TaskProvider>
      <ErrorBoundary>
        <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
          <h1>Task Manager</h1>
          <AddTask />
          <TaskList />
        </div>
      </ErrorBoundary>
    </TaskProvider>
  );
}

export default App;

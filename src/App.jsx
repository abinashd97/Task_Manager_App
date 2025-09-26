import React, { useState } from "react";
import TaskProvider from "./component/TaskContext";
import ErrorBoundary from "./component/ErrorBoundary";
import TaskList from "./component/TaskList";
import AddTask from "./component/AddTask";
import Login from "./component/Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (username) => {
    setUser(username);
  };

  return (
    <>
      {user ? (
        <TaskProvider>
          <ErrorBoundary>
            <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
              <h1>Task Manager</h1>
              <div style={{ marginBottom: 20 }}>
                Welcome, <strong>{user}</strong>!
              </div>
              <AddTask />
              <TaskList />
            </div>
          </ErrorBoundary>
        </TaskProvider>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;

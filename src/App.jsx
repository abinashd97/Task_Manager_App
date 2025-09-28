import React, { useState, useEffect } from "react";
import TaskProvider from "./component/TaskContext";
import TaskLoader from "./component/TaskLoader";
import ErrorBoundary from "./component/ErrorBoundary";
import TaskList from "./component/TaskList";
import AddTask from "./component/AddTask";
import Login from "./component/Login";
import authService from "./Service/AuthService";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (has valid token)
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.token) {
      setUser(currentUser.username || currentUser.user || "User");
    }
  }, []);

  const handleLogin = (username) => {
    setUser(username);
    // Tasks will be loaded automatically when TaskProvider mounts
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <>
      {user ? (
        <TaskProvider>
          <TaskLoader>
            <ErrorBoundary>
              <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h1>Task Manager</h1>
                  <button 
                    onClick={handleLogout}
                    style={{
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    Logout
                  </button>
                </div>
                <div style={{ marginBottom: 20 }}>
                  Welcome, <strong>{user}</strong>!
                </div>
                <AddTask />
                <TaskList />
              </div>
            </ErrorBoundary>
          </TaskLoader>
        </TaskProvider>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;

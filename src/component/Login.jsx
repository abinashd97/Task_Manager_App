import React, { useState } from "react";
import RegisterModal from "./RegisterModal";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    } else {
      alert("Please enter username and password");
    }
  };

  const handleRegister = (registeredUsername) => {
    alert(`User registered: ${registeredUsername}`);
    // Here you can add real registration logic
    setUsername(registeredUsername);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Log In
        </button>
      </form>
      <div style={{ marginTop: 15 }}>
        <span>Don't have an account? </span>
        <button
          onClick={() => setShowRegister(true)}
          style={{
            background: "none",
            border: "none",
            color: "#00fdb5ff",
            cursor: "pointer",
            fontWeight: "bold",
            padding: 0,
          }}
        >
          Register here
        </button>
      </div>

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}

export default Login;

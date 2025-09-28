import React, { useState } from "react";
import RegisterModal from "./RegisterModal";
import authService from "../Service/AuthService";
import "./Login.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(username, password);
      // The token is automatically stored in localStorage by authService
      onLogin(response.user || username); // Pass user info to parent component
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = (registeredUsername) => {
    setUsername(registeredUsername);
    setShowRegister(false);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
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
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
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

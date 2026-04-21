import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MessageBanner from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await authApi.login(form);
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card card">
        <p className="auth-kicker">Hospital Appointment System</p>
        <h1 className="auth-title">Welcome back</h1>
        <h2 className="auth-subtitle">Sign in to manage appointments</h2>
        <MessageBanner message={message} />
        <form className="form" onSubmit={handleSubmit}>
          <label className="field-label">Username</label>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
          <label className="field-label">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        <p className="auth-footer">
          New user? <Link to="/register">Register Patient / Doctor</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

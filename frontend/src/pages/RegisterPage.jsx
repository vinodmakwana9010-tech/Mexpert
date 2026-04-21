import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MessageBanner from "../components/MessageBanner";
import { authApi } from "../services/api";

const initialForm = {
  username: "",
  password: "",
  role: "patient",
  name: "",
  specialty: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await authApi.register(form);
      navigate("/login");
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card card">
        <p className="auth-kicker">Hospital Appointment System</p>
        <h1 className="auth-title">Create account</h1>
        <h2 className="auth-subtitle">Register as patient or doctor</h2>
        <MessageBanner message={message} />
        <form className="form" onSubmit={handleSubmit}>
          <label className="field-label">Role</label>
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
          <label className="field-label">Full name</label>
          <input
            placeholder="Full Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <label className="field-label">Username</label>
          <input
            placeholder="Username"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
          />
          {form.role === "doctor" ? (
            <>
              <label className="field-label">Specialty</label>
              <input
                placeholder="Specialty"
                value={form.specialty}
                onChange={(event) => setForm({ ...form, specialty: event.target.value })}
              />
            </>
          ) : null}
          <label className="field-label">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>
        <p className="auth-footer">
          Already registered? <Link to="/login">Go to login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

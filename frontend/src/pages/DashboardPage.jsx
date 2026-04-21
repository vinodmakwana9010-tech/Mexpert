/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import MessageBanner from "../components/MessageBanner";
import { useAuth } from "../context/AuthContext";
import { appointmentApi, userApi } from "../services/api";

const initialBookingForm = { doctorId: "", date: "", time: "" };

function DashboardPage() {
  const { token, user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bookingForm, setBookingForm] = useState(initialBookingForm);
  const [message, setMessage] = useState({ type: "", text: "" });

  const loadDashboardData = async () => {
    try {
      const requests = [userApi.getByRole("doctor", token), appointmentApi.getAll(token)];
      if (user?.role === "doctor") {
        requests.push(userApi.getByRole("patient", token));
      }

      const [doctorList, appointmentList, patientList] = await Promise.all(requests);
      setDoctors(doctorList);
      setPatients(Array.isArray(patientList) ? patientList : []);
      setAppointments(Array.isArray(appointmentList) ? appointmentList : []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  useEffect(() => {
    loadDashboardData();
    // We intentionally run once on page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookAppointment = async (event) => {
    event.preventDefault();
    try {
      await appointmentApi.create(bookingForm, token);
      setBookingForm(initialBookingForm);
      setMessage({ type: "success", text: "Appointment booked successfully" });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await appointmentApi.cancel(appointmentId, token);
      setMessage({ type: "success", text: "Appointment cancelled successfully" });
      loadDashboardData();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header card">
        <div>
          <p className="auth-kicker">Hospital Appointment System</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>
        <div className="user-meta">
          <span className="user-chip">
            {user?.name} ({user?.role})
          </span>
          <button onClick={logout} type="button" className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <MessageBanner message={message} />

      <section className="stats-row">
        <article className="stat-card">
          <p className="stat-label">Doctors</p>
          <p className="stat-value">{doctors.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">{user?.role === "doctor" ? "Patients" : "My Role"}</p>
          <p className="stat-value">{user?.role === "doctor" ? patients.length : "Patient"}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Appointments</p>
          <p className="stat-value">{appointments.length}</p>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="card">
          <h2 className="section-title">Doctors</h2>
          {doctors.length === 0 ? <p>No doctors available. Please register a doctor first.</p> : null}
          <ul className="plain-list">
            {doctors.map((doctor) => (
              <li key={doctor._id} className="list-item">
                <span>{doctor.name}</span>
                {doctor.specialty ? <span className="pill">{doctor.specialty}</span> : null}
              </li>
            ))}
          </ul>
        </section>

        {user?.role === "doctor" ? (
          <section className="card">
            <h2 className="section-title">Patients</h2>
            <ul className="plain-list">
              {patients.map((patient) => (
                <li key={patient._id} className="list-item">
                  <span>{patient.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {user?.role === "patient" ? (
        <section className="card">
          <h2 className="section-title">Book Appointment</h2>
          <form className="form form-inline" onSubmit={handleBookAppointment}>
            <select
              value={bookingForm.doctorId}
              onChange={(event) =>
                setBookingForm({ ...bookingForm, doctorId: event.target.value })
              }
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name}
                </option>
              ))}
            </select>
            {doctors.length === 0 ? (
              <p>Please create at least one doctor account before booking.</p>
            ) : null}
            <input
              type="date"
              value={bookingForm.date}
              onChange={(event) => setBookingForm({ ...bookingForm, date: event.target.value })}
            />
            <input
              type="time"
              value={bookingForm.time}
              onChange={(event) => setBookingForm({ ...bookingForm, time: event.target.value })}
            />
            <button type="submit" className="btn-primary">Book</button>
          </form>
        </section>
      ) : null}

      <section className="card">
        <h2 className="section-title">Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <ul className="appointment-list">
            {appointments.map((appointment) => (
              <li key={appointment._id}>
                <div className="appointment-meta">
                  <p className="appointment-datetime">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="appointment-people">
                    Doctor: {appointment.doctor?.name} | Patient: {appointment.patient?.name}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleCancelAppointment(appointment._id)}
                >
                  Cancel Appointment
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;

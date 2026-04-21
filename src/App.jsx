import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  UserPlus, 
  LogIn, 
  LogOut, 
  Calendar, 
  Clock, 
  Trash2, 
  Stethoscope, 
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Users
} from 'lucide-react';

/**
 * HOSPITAL APPOINTMENT SYSTEM
 * * Functional Overview:
 * 1. User Management: Register & Authenticate (Doctor/Patient roles).
 * 2. Dashboard: Context-aware views based on user role.
 * 3. Appointment Management: Booking, fetching, and cancellation logic.
 * 4. State Management: Simulated MongoDB/Express backend using React state.
 */

const App = () => {
  // --- Simulated Database State ---
  const [users, setUsers] = useState([
    { id: '1', username: 'dr_smith', password: 'password', role: 'doctor', name: 'Dr. Alice Smith', specialty: 'Cardiology' },
    { id: '2', username: 'dr_jones', password: 'password', role: 'doctor', name: 'Dr. Bob Jones', specialty: 'Dermatology' },
    { id: '3', username: 'patient1', password: 'password', role: 'patient', name: 'Charlie Brown' }
  ]);
  
  const [appointments, setAppointments] = useState([
    { id: '101', patientId: '3', doctorId: '1', date: '2023-12-01', time: '10:00', status: 'booked' }
  ]);

  // --- Session State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, dashboard
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Form States ---
  const [authData, setAuthData] = useState({ username: '', password: '', role: 'patient', name: '', specialty: '' });
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', time: '' });

  // --- UI Helpers ---
  const notify = (msg, type = 'error') => {
    if (type === 'error') {
      setError(msg);
      setSuccess('');
    } else {
      setSuccess(msg);
      setError('');
    }
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // --- Core Functionalities (API Simulation) ---

  // 1. Register Patient / Doctor
  const handleRegister = (e) => {
    e.preventDefault();
    const { username, password, role, name, specialty } = authData;
    
    if (!username || !password || !name) return notify('Please fill all fields');
    if (users.find(u => u.username === username)) return notify('Username already exists');

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password,
      role,
      name,
      specialty: role === 'doctor' ? specialty : null
    };

    setUsers([...users, newUser]);
    notify('Registration successful! Please login.', 'success');
    setView('login');
  };

  // 2. Authenticate
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === authData.username && u.password === authData.password);
    if (user) {
      setCurrentUser(user);
      setView('dashboard');
      notify(`Welcome back, ${user.name}`, 'success');
    } else { 
      notify('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setAuthData({ username: '', password: '', role: 'patient', name: '', specialty: '' });
  };

  // 3. Book Appointment
  const handleBookAppointment = (e) => {
    e.preventDefault();
    const { doctorId, date, time } = bookingData;

    if (!doctorId || !date || !time) return notify('Please fill all appointment details');

    const newAppointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: currentUser.id,
      doctorId,
      date,
      time,
      status: 'booked'
    };

    setAppointments([...appointments, newAppointment]);
    notify('Appointment booked successfully!', 'success');
    setBookingData({ doctorId: '', date: '', time: '' });
  };

  // 4. Cancel Appointment
  const handleCancelAppointment = (id) => {
    setAppointments(appointments.filter(app => app.id !== id));
    notify('Appointment cancelled', 'success');
  };

  // --- Derived Data ---
  const doctorsList = useMemo(() => users.filter(u => u.role === 'doctor'), [users]);
  const patientsList = useMemo(() => users.filter(u => u.role === 'patient'), [users]);
  
  const userAppointments = useMemo(() => {
    if (!currentUser) return [];
    return appointments.filter(app => 
      currentUser.role === 'doctor' ? app.doctorId === currentUser.id : app.patientId === currentUser.id
    ).map(app => ({
      ...app,
      doctorName: users.find(u => u.id === app.doctorId)?.name,
      patientName: users.find(u => u.id === app.patientId)?.name
    }));
  }, [appointments, currentUser, users]);

  // --- Sub-Components ---

  const AuthLayout = ({ children, title, subtitle }) => (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-circle">
            <Stethoscope size={32} color="white" />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} /> {success}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  // --- Views ---

  if (view === 'login') {
    return (
      <>
        <Styles />
        <AuthLayout title="Welcome Back" subtitle="Log in to manage your appointments">
          <form onSubmit={handleLogin} className="form-stack">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input"
                placeholder="Enter username"
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
              />
            </div>
            <button className="btn btn-primary btn-full">
              <LogIn size={18} /> Login
            </button>
            <p className="auth-footer-text">
              Don't have an account? <button type="button" onClick={() => setView('register')} className="btn-link">Register</button>
            </p>
          </form>
        </AuthLayout>
      </>
    );
  }

  if (view === 'register') {
    return (
      <>
        <Styles />
        <AuthLayout title="Join Our System" subtitle="Create your healthcare account">
          <form onSubmit={handleRegister} className="form-stack">
            <div className="form-group">
              <label className="form-label">Role</label>
              <select 
                className="form-input"
                value={authData.role}
                onChange={(e) => setAuthData({...authData, role: e.target.value})}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                className="form-input"
                placeholder="John Doe"
                value={authData.name}
                onChange={(e) => setAuthData({...authData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                className="form-input"
                placeholder="johndoe123"
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})}
              />
            </div>
            {authData.role === 'doctor' && (
              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input 
                  className="form-input"
                  placeholder="e.g. Cardiology"
                  value={authData.specialty}
                  onChange={(e) => setAuthData({...authData, specialty: e.target.value})}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
              />
            </div>
            <button className="btn btn-primary btn-full mt-2">
              <UserPlus size={18} /> Register
            </button>
            <p className="auth-footer-text">
              Already registered? <button type="button" onClick={() => setView('login')} className="btn-link">Login</button>
            </p>
          </form>
        </AuthLayout>
      </>
    );
  }

  // --- Dashboard View ---
  return (
    <div className="dashboard-container">
      <Styles />
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">
            <Stethoscope size={24} />
          </div>
          <span className="logo-text">MedConnect</span>
        </div>

        <nav className="sidebar-nav">
          <div className="user-profile-box">
            <p className="profile-label">Signed in as</p>
            <p className="profile-name">{currentUser.name}</p>
            <p className="profile-role">{currentUser.role}</p>
          </div>
          
          <button className="nav-item active">
            <ClipboardList size={18} /> Dashboard
          </button>
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} /> Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-inner">
          <header className="page-header">
            <div>
              <h1 className="page-title">Hospital Dashboard</h1>
              <p className="page-subtitle">Manage your medical appointments and records.</p>
            </div>
            {success && (
              <div className="success-pill">
                <CheckCircle2 size={16} /> {success}
              </div>
            )}
          </header>

          <div className="dashboard-grid">
            {/* Left Column */}
            <div className="col-left">
              {currentUser.role === 'patient' ? (
                <section className="card">
                  <h2 className="card-title">
                    <Calendar className="icon-blue" size={20} /> Book Appointment
                  </h2>
                  <form onSubmit={handleBookAppointment} className="form-stack">
                    <div className="form-group">
                      <label className="form-label">Select Doctor</label>
                      <select 
                        className="form-input"
                        value={bookingData.doctorId}
                        onChange={(e) => setBookingData({...bookingData, doctorId: e.target.value})}
                      >
                        <option value="">Choose a specialist...</option>
                        {doctorsList.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialty})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-row">
                      <div className="form-group half">
                        <label className="form-label-small">Date</label>
                        <input 
                          type="date"
                          className="form-input text-sm"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        />
                      </div>
                      <div className="form-group half">
                        <label className="form-label-small">Time</label>
                        <input 
                          type="time"
                          className="form-input text-sm"
                          value={bookingData.time}
                          onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                        />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-full shadow-blue">
                      Confirm Appointment
                    </button>
                  </form>
                </section>
              ) : (
                <section className="card">
                  <h2 className="card-title">
                    <Users className="icon-blue" size={20} /> Patient Statistics
                  </h2>
                  <div className="stats-grid">
                    <div className="stat-box stat-blue">
                      <p className="stat-label">Today</p>
                      <p className="stat-value">{userAppointments.length}</p>
                    </div>
                    <div className="stat-box stat-emerald">
                      <p className="stat-label">Completed</p>
                      <p className="stat-value">0</p>
                    </div>
                  </div>
                </section>
              )}

              <section className="card">
                <h2 className="section-header">System Directory</h2>
                <div className="directory-list">
                  <h3 className="directory-title">Available Doctors</h3>
                  <div className="doctor-items">
                    {doctorsList.map(doc => (
                      <div key={doc.id} className="doctor-card">
                        <div className="avatar-circle">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="doctor-name">{doc.name}</p>
                          <p className="doctor-spec">{doc.specialty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="col-right">
              <div className="card table-card">
                <div className="table-header">
                  <h2 className="card-title">Appointments Schedule</h2>
                  <span className="badge-blue">
                    {userAppointments.length} Total
                  </span>
                </div>
                
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>{currentUser.role === 'doctor' ? 'Patient' : 'Doctor'}</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="table-empty">
                            No appointments found.
                          </td>
                        </tr>
                      ) : (
                        userAppointments.map(app => (
                          <tr key={app.id}>
                            <td>
                              <div className="flex-row gap-3">
                                <div className="icon-box-small">
                                  <Clock size={16} />
                                </div>
                                <div>
                                  <p className="font-bold">{app.date}</p>
                                  <p className="text-muted">{app.time}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <p className="font-medium text-slate">
                                {currentUser.role === 'doctor' ? app.patientName : app.doctorName}
                              </p>
                              <span className="status-badge">
                                Confirmed
                              </span>
                            </td>
                            <td className="text-right">
                              <button 
                                onClick={() => handleCancelAppointment(app.id)}
                                className="delete-btn"
                                title="Cancel Appointment"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Styles = () => (
  <style>{`
    :root {
      --primary: #2563eb;
      --primary-dark: #1d4ed8;
      --bg: #f8fafc;
      --white: #ffffff;
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-400: #94a3b8;
      --slate-500: #64748b;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --red: #ef4444;
      --green: #10b981;
    }

    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--slate-800); }

    /* Auth Styles */
    .auth-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .auth-card { max-width: 400px; width: 100%; background: var(--white); border-radius: 1rem; padding: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid var(--slate-100); }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-icon-circle { background: var(--primary); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
    .auth-title { font-size: 1.5rem; font-bold; color: var(--slate-800); margin: 0; }
    .auth-subtitle { color: var(--slate-500); margin-top: 0.5rem; }
    .auth-footer-text { text-align: center; font-size: 0.875rem; color: var(--slate-600); margin-top: 1rem; }

    /* Dashboard Layout */
    .dashboard-container { display: flex; min-height: 100vh; flex-direction: column; }
    @media (min-width: 768px) { .dashboard-container { flex-direction: row; } }

    .sidebar { background: var(--slate-900); color: white; width: 100%; padding: 1.5rem; display: flex; flex-direction: column; }
    @media (min-width: 768px) { .sidebar { width: 260px; min-height: 100vh; } }
    
    .sidebar-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2.5rem; }
    .logo-icon { background: var(--primary); padding: 0.5rem; border-radius: 0.5rem; }
    .logo-text { font-weight: 700; font-size: 1.25rem; }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 1rem; }
    .user-profile-box { padding: 0.75rem; background: rgba(255,255,255,0.05); border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 1rem; }
    .profile-label { font-size: 0.7rem; text-transform: uppercase; color: var(--slate-400); margin: 0; font-weight: 600; }
    .profile-name { font-weight: 500; color: #93c5fd; margin: 0.25rem 0; overflow: hidden; text-overflow: ellipsis; }
    .profile-role { font-size: 0.75rem; color: var(--slate-400); text-transform: capitalize; margin: 0; }

    .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 0.5rem; width: 100%; text-align: left; background: transparent; border: none; color: var(--slate-400); cursor: pointer; }
    .nav-item.active { background: var(--primary); color: white; }

    .logout-btn { margin-top: auto; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; color: var(--slate-400); background: transparent; border: none; cursor: pointer; transition: color 0.2s; }
    .logout-btn:hover { color: white; }

    .main-content { flex: 1; padding: 1.5rem; overflow-y: auto; }
    @media (min-width: 768px) { .main-content { padding: 2.5rem; } }
    .content-inner { max-width: 1000px; margin: 0 auto; }

    .page-header { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    @media (min-width: 640px) { .page-header { flex-direction: row; justify-content: space-between; align-items: center; } }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--slate-800); margin: 0; }
    .page-subtitle { color: var(--slate-500); margin: 0.25rem 0 0; }

    .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
    @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 2fr; } }

    /* Cards & Components */
    .card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid var(--slate-200); margin-bottom: 2rem; }
    .card-title { font-size: 1.125rem; font-weight: 700; margin-top: 0; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
    .section-header { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; opacity: 0.5; margin-bottom: 1rem; }

    .form-stack { display: flex; flex-direction: column; gap: 1rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .form-row { display: flex; gap: 0.75rem; }
    .half { flex: 1; }
    .form-label { font-size: 0.875rem; font-weight: 500; color: var(--slate-700); }
    .form-label-small { font-size: 0.75rem; font-weight: 500; color: var(--slate-600); }
    .form-input { padding: 0.5rem 0.75rem; border: 1px solid var(--slate-200); border-radius: 0.5rem; outline: none; width: 100%; transition: border 0.2s; }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(37,99,235,0.1); }

    .btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
    .btn-primary { background: var(--primary); color: white; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-full { width: 100%; }
    .btn-link { color: var(--primary); background: none; border: none; font-weight: 500; cursor: pointer; padding: 0; }
    .shadow-blue { box-shadow: 0 4px 6px rgba(37,99,235,0.2); }

    .alert { padding: 0.75rem; border-radius: 0.5rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .alert-error { background: #fef2f2; color: var(--red); border: 1px solid #fee2e2; }
    .alert-success { background: #f0fdf4; color: var(--green); border: 1px solid #dcfce7; }
    .success-pill { background: #f0fdf4; color: var(--green); padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.875rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }

    .stats-grid { display: grid; grid-cols: 1fr 1fr; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .stat-box { padding: 1rem; border-radius: 0.75rem; }
    .stat-blue { background: #eff6ff; }
    .stat-emerald { background: #ecfdf5; }
    .stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin: 0; }
    .stat-blue .stat-label { color: #2563eb; }
    .stat-emerald .stat-label { color: #059669; }
    .stat-value { font-size: 1.5rem; font-weight: 700; margin: 0.25rem 0 0; }

    /* Tables */
    .table-card { padding: 0; overflow: hidden; }
    .table-header { padding: 1.5rem; border-bottom: 1px solid var(--slate-100); display: flex; justify-content: space-between; align-items: center; }
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { background: var(--slate-50); padding: 1rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; color: var(--slate-500); font-weight: 700; }
    .data-table td { padding: 1rem 1.5rem; border-bottom: 1px solid var(--slate-100); vertical-align: middle; }
    .data-table tr:hover { background: var(--slate-50); }
    .table-empty { padding: 3rem; text-align: center; color: var(--slate-400); font-style: italic; }

    /* Helpers */
    .flex-row { display: flex; align-items: center; }
    .gap-3 { gap: 0.75rem; }
    .text-right { text-align: right; }
    .text-sm { font-size: 0.875rem; }
    .text-muted { font-size: 0.875rem; color: var(--slate-500); }
    .font-bold { font-weight: 700; }
    .icon-blue { color: var(--primary); }
    .badge-blue { background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
    .status-badge { background: #eff6ff; color: #2563eb; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 0.25rem; text-transform: uppercase; font-weight: 700; }
    .delete-btn { color: #f87171; background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: all 0.2s; }
    .delete-btn:hover { color: var(--red); background: #fef2f2; }
    .icon-box-small { background: var(--slate-100); padding: 0.5rem; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; color: var(--slate-600); }

    .doctor-card { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--slate-50); border-radius: 0.5rem; margin-bottom: 0.5rem; }
    .avatar-circle { width: 32px; height: 32px; border-radius: 50%; background: #dbeafe; color: #2563eb; display: flex; align-items: center; justify-content: center; }
    .doctor-name { font-weight: 500; font-size: 0.875rem; margin: 0; }
    .doctor-spec { font-size: 0.75rem; color: var(--slate-500); margin: 0; }
  `}</style>
);

export default App;
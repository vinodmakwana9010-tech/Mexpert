import { AuthProvider, useAuth } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function AppShell() {
  const { token } = useAuth();
  return <AppRoutes defaultPath={token ? "/dashboard" : "/login"} />;
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;
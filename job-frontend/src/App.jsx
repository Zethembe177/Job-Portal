import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import EmployerDashboard from "./pages/EmployerDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import ListingDetails from "./pages/ListingDetails";

function App() {
  const { user, logout } = useAuth();

  const PrivateRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" />;
    if (role && user.role !== role) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <Navbar userRole={user?.role} logout={logout} />

      <div className="p-4">
        <Routes>
         

          <Route path="/register" element={<Registration />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/employer"
            element={
              <PrivateRoute role="employer">
                <EmployerDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/candidate"
            element={
              <PrivateRoute role="candidate">
                <CandidateDashboard />
              </PrivateRoute>
            }
          />

          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route
  path="/analytics"
  element={
    <PrivateRoute role="employer">
      <AnalyticsDashboard />
    </PrivateRoute>
  }
/>

        </Routes>
      </div>
    </Router>
  );
}

export default App;

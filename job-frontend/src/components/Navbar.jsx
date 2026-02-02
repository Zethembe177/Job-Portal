import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ userRole, logout }) {
  return (
    <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
      <div className="text-lg font-bold">Hire-Hub</div>

      <div className="space-x-4">
        {/* Not logged in */}
        {!userRole && (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        )}

        {/* Logged in */}
        {userRole && (
          <>
            {/* Employer Links */}
            {userRole === "employer" && (
              <>
                <Link to="/employer" className="hover:underline">Employer Dashboard</Link>
                <Link to="/analytics" className="hover:underline">Analytics Dashboard</Link>
              </>
            )}

            {/* Candidate Links */}
            {userRole === "candidate" && (
              <Link to="/candidate" className="hover:underline">Candidate Dashboard</Link>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

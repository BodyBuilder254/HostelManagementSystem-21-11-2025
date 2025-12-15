// src/Components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

function ProtectedRoute({ user, children }) {
  if (!user) {
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
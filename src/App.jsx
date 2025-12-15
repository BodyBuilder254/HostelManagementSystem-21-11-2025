// src/Components/App.jsx
import {BrowserRouter as Router, Routes, Route, Link, Navigate} from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Config/Firebase.js";

import Register from "./Registration/Registration.jsx";
import Login from "./Registration/Login.jsx";
import LogOut from "./Registration/LogOut.jsx";
import Home from "./Home/Home.jsx";
import Tenants from "./Tenants/Tenants.jsx";
import Rooms from "./Rooms/Rooms.jsx";
import Payment from "./Payment/Payment.jsx";
import Tracking from "./TenantsTracking/Tracking.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import styles from "./App.module.css";

function App(){
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check screen size
    function checkScreenSize(){
      setIsMobile(window.innerWidth <= 575);
    }
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    // Check authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      window.removeEventListener("resize", checkScreenSize);
      unsubscribe();
    };
  }, []);

  // Show loading while checking auth state
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <Router>
      {/* Mobile menu toggle button - only show on mobile */}
      {isMobile && (
        <button 
          className={styles.menuToggle}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
        </button>
      )}

      {/* Navbar */}
      <div className={`${styles.myDiv} ${isMenuOpen ? styles.navOpen : ''}`}>
        {/* Always show Home link */}
        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
        
        {/* Show Register/Login only when NOT logged in */}
        {!user && (
          <>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
          </>
        )}
        
        {/* Show protected routes only when logged in */}
        {user && (
          <>
            <Link to="/rooms" onClick={() => setIsMenuOpen(false)}>Rooms</Link>
            <Link to="/tenants" onClick={() => setIsMenuOpen(false)}>Tenants</Link>
            <Link to="/tracking" onClick={() => setIsMenuOpen(false)}>Tracking</Link>
            <Link to="/payment" onClick={() => setIsMenuOpen(false)}>Payment</Link>
            <Link to="/logOut" onClick={() => setIsMenuOpen(false)}>LogOut</Link>
          </>
        )}
      </div>

      <Routes>
        {/* Public routes */}
        <Route path="/register" element={
          user ? <Navigate to="/" replace /> : <Register />
        } />
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <Login />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute user={user}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/rooms" element={
          <ProtectedRoute user={user}>
            <Rooms />
          </ProtectedRoute>
        } />
        <Route path="/tenants" element={
          <ProtectedRoute user={user}>
            <Tenants />
          </ProtectedRoute>
        } />
        <Route path="/tracking" element={
          <ProtectedRoute user={user}>
            <Tracking />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
          <ProtectedRoute user={user}>
            <Payment />
          </ProtectedRoute>
        } />
        <Route path="/logOut" element={
          <ProtectedRoute user={user}>
            <LogOut />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
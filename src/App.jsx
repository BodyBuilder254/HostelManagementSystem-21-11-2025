
import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";

// import Counter from "./Counter/Counter.jsx";
// import app from "./firebase.js";

import Home from "./Home/Home.jsx";
import Tenants from "./Tenants/Tenants.jsx";
import Rooms from "./Rooms/Rooms.jsx";
import Payment from "./Payment/Payment.jsx";
import Tracking from "./TenantsTracking/Tracking.jsx";

import styles from "./App.module.css";

import { useState, useEffect } from "react";

function App(){

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(()=>{
    function checkScreenSize(){
      setIsMobile(window.innerWidth <= 575);
    }
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return ()=> window.removeEventListener("resize", checkScreenSize);
  }, []);

  return(

    // <Counter/>

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
        <Link to="/" onClick={()=> setIsMenuOpen(false)} >Home</Link>
        <Link to="/rooms" onClick={()=> setIsMenuOpen(false)} >Rooms</Link>
        <Link to="/tenants" onClick={()=> setIsMenuOpen(false)} >Tenants</Link>
        <Link to="/tracking" onClick={()=> setIsMenuOpen(false)} >Tracking</Link>
        <Link to="/payment" onClick={()=> setIsMenuOpen(false)} >Payment</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/rooms" element = {<Rooms/>} />
        <Route path="/tenants" element = {<Tenants/>} />
        <Route path="/Tracking" element = {<Tracking/>} />
        <Route path="/Payment" element = {<Payment/>} />
      </Routes>
    </Router>

  );
}
export default App;

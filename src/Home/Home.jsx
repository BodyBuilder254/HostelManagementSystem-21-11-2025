
import styles from "./Home.module.css";
import Tenants from "../Tenants/Tenants.jsx";

import {Link} from "react-router-dom";

import { useEffect } from "react";

function Home() {
  useEffect(()=>{
    document.title = "HomePage";
  }, []);
  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to Our Hostel Management System</h1>
        <p className={styles.subtitle}>
          Manage tenants, rooms, payments, and tracking — all in one simple and
          beautiful dashboard.
        </p>
        <Link to={"/tenants"}>
          <button className={styles.cta}>Get Started</button>
        </Link>
      </div>

      <div className={styles.features}>
        <div className={styles.card}>
          <h2>🏠 Tenants</h2>
          <p>Add, update, and manage all tenant records easily.</p>
        </div>

        <div className={styles.card}>
          <h2>📦 Booking & Allocation</h2>
          <p>Track room availability and allocate rooms instantly.</p>
        </div>

        <div className={styles.card}>
          <h2>💰 Payments</h2>
          <p>Monitor bills, balances, and rent collection.</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

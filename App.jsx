

import {BrowserRouter as Router, Routes, Route, Link} from "react-router-dom";

// import Counter from "./Counter/Counter.jsx";
// import app from "./firebase.js";

import Home from "./Home/Home.jsx";
import Tenants from "./Tenants/Tenants.jsx";
import Rooms from "./Rooms/Rooms.jsx";
import Payment from "./Payment/Payment.jsx";
import Tracking from "./TenantsTracking/Tracking.jsx";

import styles from "./App.module.css";

function App(){

  return(

    // <Counter/>

    <Router>
      <div className={styles.myDiv} >
        <Link to="/" >Home</Link>
        <Link to="/rooms" >Rooms</Link>
        <Link to="/tenants" >Tenants</Link>
        <Link to="/tracking" >Tracking</Link>
        <Link to="/payment" >Payment</Link>
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


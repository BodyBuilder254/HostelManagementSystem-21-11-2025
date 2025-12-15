// src/Components/Registration/LogOut.jsx
import { useNavigate } from "react-router-dom";
import styles from "./Registration.module.css";
import { auth } from "../Config/Firebase.js";
import { signOut } from "firebase/auth";

function LogOut(){
    const navigate = useNavigate();

    async function handleSignOut(){
        try{
            await signOut(auth);
            window.alert("Logout Successful");
            // After logout, redirect to register page
            navigate("/register");
        }catch(error){
            console.error(error);
            window.alert("Please try again");
        }
    }
    
    return(
        <div className={styles.myDiv}>
            <h2>Are you sure you want to logout?</h2>
            <button onClick={handleSignOut} style={{backgroundColor: "blueviolet", color: "#fff", padding: "10px 20px"}}>
                LogOut
            </button>
            <button onClick={() => navigate("/")} style={{backgroundColor: "gray", color: "#fff", marginLeft: "10px", padding: "10px 20px"}}>
                Cancel
            </button>
        </div>
    );
}

export default LogOut;
// src/Components/Registration/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Registration.module.css";
import { auth } from "../Config/Firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    async function handleLogin(event){
        event.preventDefault();

        try{
            await signInWithEmailAndPassword(auth, email, password);
            window.alert("Login is successful");
            // After successful login, navigate to home page
            navigate("/");
            setEmail("");
            setPassword("");
        }catch(error){
            console.error(error);
            window.alert("Wrong email or password!");
        }
    }

    return(
        <div className={styles.myDiv}>
            <h2>Login</h2>
            <form onSubmit={handleLogin} className={styles.myForm} >
                <input type="text" value={email} onChange={(event)=> setEmail(event.target.value)} 
                       placeholder="Enter your Email" required/>
                <input type="password" value={password} onChange={(event)=> setPassword(event.target.value)} 
                       placeholder="Enter your Password" required />
                <button type="submit" style={{backgroundColor: "blueviolet", color: "#fff"}} >
                    Login
                </button>
            </form>
            <p>Don't have an account?</p>
            <button onClick={() => navigate("/register")} style={{backgroundColor: "gray", color: "#fff"}}>
                Create Account
            </button>
        </div>
    );
}

export default Login;
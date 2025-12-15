// src/Components/Registration/Registration.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Registration.module.css";
import { auth } from "../Config/Firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Register(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();

    async function handleSignUp(event){
        event.preventDefault();

        if(!email.endsWith(".com") || !email.includes("@") || email.indexOf("@") < 3){
            window.alert("Enter valid email");
            return;
        }
        else if(password.length < 8 || password.length > 15){
            window.alert("Password must be 8-15 characters in length");
            return;
        }
        else if(password !== confirmPassword){
            window.alert("The two passwords must be matching");
            return;
        }
        else{
            try{
                await createUserWithEmailAndPassword(auth, email, password);
                window.alert("Registration is successful");
                // After successful registration, navigate to login
                navigate("/login");
            }catch(error){
                console.error(error);
                window.alert("Registration failed! ");
            }
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        }
    }

    return(
        <div className={styles.myDiv} >
            <h2>Create Account</h2>
            <form onSubmit={handleSignUp} className={styles.myForm} >
                <input type="text" value={email} onChange={(event)=> setEmail(event.target.value)} 
                       placeholder="Enter your Email" required/>
                <input type="password" value={password} onChange={(event)=> setPassword(event.target.value)} 
                       placeholder="Enter your password" required/>
                <input type="password" value={confirmPassword} onChange={(event)=> setConfirmPassword(event.target.value)} 
                       placeholder="Confirm your password" required/>
                <button type="submit" >Sign Up</button>
            </form>
            <p>Already have an account?</p>
            <Link to="/login" ><button>Login Here</button></Link>
        </div>
    );
}

export default Register;
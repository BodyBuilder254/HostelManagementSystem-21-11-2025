// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {getFirestore} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfIJcOlQqEN9lqioVfwXOnGgIsSpBL4GY",
  authDomain: "hostel-2025.firebaseapp.com",
  projectId: "hostel-2025",
  storageBucket: "hostel-2025.firebasestorage.app",
  messagingSenderId: "773225837542",
  appId: "1:773225837542:web:a30f7ed4b8d6e34ae31c27",
  measurementId: "G-YBHVPF6Q6E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const database = getFirestore(app);

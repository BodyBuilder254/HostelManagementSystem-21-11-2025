import { useState, useEffect } from "react";
import { auth, db } from "../Config/Firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function useUserRole() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }
      
      try {
        // Try to get user role from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        } else {
          // New user - assign role based on email
          const defaultRole = determineRoleFromEmail(user.email);
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            role: defaultRole,
            createdAt: new Date()
          });
          setUserRole(defaultRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setUserRole("student"); // Fallback to student
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserRole();
  }, []);
  
  // Assign roles based on email patterns
  const determineRoleFromEmail = (email) => {
    // YOU: Replace these with your actual email addresses
    const developerEmails = ["your.email@developer.com", "admin@yourdomain.com"];
    const matronEmails = ["matron.email@example.com"];
    const ownerEmails = ["owner1@example.com", "owner2@example.com"];
    
    if (developerEmails.includes(email)) return "developer";
    if (matronEmails.includes(email)) return "matron";
    if (ownerEmails.includes(email)) return "owner";
    
    // Default for all other emails
    return "student";
  };
  
  // Helper functions for components
  const isDeveloper = userRole === "developer";
  const isMatron = userRole === "matron";
  const isOwner = userRole === "owner";
  const isStudent = userRole === "student";
  
  // Permission checks
  const canEditDelete = isDeveloper || isMatron;
  const canAddData = isDeveloper || isMatron;
  const canSearch = isDeveloper || isMatron || isOwner;
  const canExport = isDeveloper || isMatron || isOwner;
  const canViewRooms = !isStudent; // Everyone except students
  
  return { 
    userRole, 
    loading,
    isDeveloper,
    isMatron,
    isOwner,
    isStudent,
    canEditDelete,
    canAddData,
    canSearch,
    canExport,
    canViewRooms
  };
}
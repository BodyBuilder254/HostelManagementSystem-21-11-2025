 
import React, {useState, useEffect} from "react";

import styles from "./Tracking.module.css";

function Tracking(){

    const [idNumber, setIDNumber] = useState("");
    const [myTenants, setMyTenants] = useState(JSON.parse(localStorage.getItem("20251110MYTenants")) || []);
    const [myRooms, setMyRooms] = useState(JSON.parse(localStorage.getItem("20251112MyRooms")) || []);

    useEffect(()=>{
        localStorage.setItem("20251110MYTenants", JSON.stringify(myTenants));
        console.log(myTenants);
    }, [myTenants]);
    
    function handleIDNumber(event){
        setIDNumber(event.target.value);
    }
    function handleCheckIn(){
        // Check IF ID Number is Valid
        if(idNumber.length !== 8 || idNumber < 10000000){
            window.alert("Enter valid ID Number");
        }
        else{
            const tenantsCopy = [...myTenants];
            const tenantIndex = tenantsCopy.findIndex(tenant => tenant.IDNumber === idNumber);

            // Check if Tenant is Existing
            if(tenantIndex === -1){
                window.alert("No tenant found");
            }
            else{
                const tenant = tenantsCopy[tenantIndex];

                // Check IF Tenant is Active
                if(tenant.Status === "Active"){
                    window.alert("Tenant is alreday checked in");
                }

                else{
                    setIDNumber("");
                    // Check if StayHistory Exists
                    if(!tenant.StayHistory){
                        tenant.StayHistory = [];
                    }
                    
                    const room = myRooms.find(room => room.RoomNumber === tenant.RoomNumber);

                    tenant.StayHistory.push({
                        StartDate: new Date().toISOString().split("T")[0],
                        EndDate: null,
                        RoomNumber: tenant.RoomNumber,
                        MonthlyCharges: room.MonthlyCharges
                    });

                    tenant.Status = "Active";

                    tenantsCopy[tenantIndex] = tenant;

                    setMyTenants(tenantsCopy);

                    window.alert("Tenant successfully checked IN!");
                }
            }

        }

    }
    function handleCheckOut(){
        // Check IF ID Number is Valid
        if(idNumber.length !== 8 || idNumber < 10000000){
            window.alert("Enter valid ID Number");
        }
        else{
            const tenantsCopy = [...myTenants];
            const tenantIndex = tenantsCopy.findIndex(tenant => tenant.IDNumber === idNumber);
            // Check if Tenant is Existing
            if(tenantIndex === -1){
                window.alert("No Tenant Found !");
            }
            else{
                const tenant = tenantsCopy[tenantIndex];
                if(tenant.Status !== "Active"){
                    window.alert("Tenant is already away or has not checked in!");
                }
                else{
                    // Check if StayHistory Exists
                    if(!tenant.StayHistory || tenant.StayHistory.length === 0){
                        window.alert("Check-in history missing!")
                    }
                    else{
                        const lastStay = tenant.StayHistory[tenant.StayHistory.length - 1];
                        if(lastStay.EndDate !== null){
                            window.alert("This tenant is not currently active!");
                        }
                        else{
                            setIDNumber("");
                            lastStay.EndDate = new Date().toISOString().split("T")[0];
                            tenant.Status = "Away";
                            tenantsCopy[tenantIndex] = tenant;

                            setMyTenants(tenantsCopy);

                            window.alert("Tenant successfully checked OUT!");
                            
                        }
                    }
                }

            }
        }
    }
    return(
        <div className={styles.myDiv} >
            <h1>Check In and Out</h1>
            <input value={idNumber} onChange={handleIDNumber} type="number" placeholder="Enter ID Number" min={10000000}/>
            <button onClick={handleCheckIn}>Check In</button>
            <button onClick={handleCheckOut}>Check Out</button>
        </div>
    );
}

export default Tracking;

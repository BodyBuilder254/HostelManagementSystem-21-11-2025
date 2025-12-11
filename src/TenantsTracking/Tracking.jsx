 
import React, {useState, useEffect} from "react";

import styles from "./Tracking.module.css";

import { database } from "../Config/Firebase";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

function Tracking(){

    //LOCAL STORAGE const [myTenants, setMyTenants] = useState(JSON.parse(localStorage.getItem("20251110MYTenants")) || []);
    //OLD SYSTEM const [myRooms, setMyRooms] = useState(JSON.parse(localStorage.getItem("20251112MyRooms")) || []);
    
    const [idNumber, setIDNumber] = useState("");
    const [myTenants, setMyTenants] = useState([]);
    const [myRooms, setMyRooms] = useState([]);
    const [roomNumber, setRoomNumber] = useState("");
    const [loading, setLoading] = useState(true);

    const tenantsCollection = collection(database, "Tenants");
    const roomsCollection = collection(database, "Rooms");


    useEffect(()=>{
        //OLD SYSTEM localStorage.setItem("20251110MYTenants", JSON.stringify(myTenants));
        async function fetchData(){
            setLoading(true);
            await fetchTenants();
            await fetchRooms();
            setLoading(false);
        }    
        document.title = "CheckIn/Out-Page"
        
    }, []);

    if(loading){
        <div className = {styles.loading} >Loading...</div>
    }

    async function fetchTenants(){
        try{
            const querySnapshot = getDocs(tenantsCollection);
            const tenantsData = (await querySnapshot).docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyTenants(tenantsData);
        }catch(error){
            console.error(error);
            window.alert("Failed to load Tenants data !");
        }
    }
    
    async function fetchRooms(){
        try{
            const querySnapshot = getDocs(roomsCollection);
            const roomsData = (await querySnapshot).docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyRooms(roomsData);
        }catch(error){
            console.error(error);
        }
    }
    function handleRoomNumber(event){
        setRoomNumber(event.target.value);
    }
    function handleIDNumber(event){
        setIDNumber(event.target.value);
    }
    async function handleCheckIn(){
        // Check IF ID Number is Valid
        if(!roomNumber){
            window.alert("Select valid Room !");
        }
        else if(idNumber.length !== 8 || idNumber < 10000000){
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
                try{
                    const tenant = tenantsCopy[tenantIndex];

                    // Check IF Tenant is Active
                    if(tenant.Status === "Active"){
                        window.alert("Tenant is alreday checked in");
                    }

                    else{
                        setIDNumber("");
                        setRoomNumber("");
                        // Check if StayHistory Exists
                        if(!tenant.StayHistory){
                            tenant.StayHistory = [];
                        }
                        
                        const room = myRooms.find(room => room.RoomNumber === roomNumber);
                        tenant.RoomNumber = room.RoomNumber;

                        tenant.StayHistory.push({
                            StartDate: new Date().toISOString().split("T")[0],
                            EndDate: null,
                            RoomNumber: room.RoomNumber,
                            MonthlyCharges: room.MonthlyCharges
                        });

                        tenant.Status = "Active";
                        tenant.EntryDate = new Date().toISOString().split("T")[0];

                        const tenantId = tenantsCopy[tenantIndex].id;
                        const tenantDoc = doc(database, "Tenants", tenantId);
                        await updateDoc(tenantDoc, tenant);
                        await fetchTenants();

                        window.alert("Tenant successfully checked IN!");
                }}catch(error){
                    console.error(error);
                    window.alert("Operation has failed ! Please try again later !");
                }
            }

        }

    }
    async function handleCheckOut(){
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
                        try{
                            const lastStay = tenant.StayHistory[tenant.StayHistory.length - 1];
                            if(lastStay.EndDate !== null){
                                window.alert("This tenant is not currently active!");
                            }
                            else{
                                setIDNumber("");
                                lastStay.EndDate = new Date().toISOString().split("T")[0];
                                tenant.Status = "Away";

                                
                                const tenantId = tenantsCopy[tenantIndex].id;
                                const tenantDoc = doc(database, "Tenants", tenantId);
                                await updateDoc(tenantDoc, tenant);

                                window.alert("Tenant successfully checked OUT");
                            
                        }}catch(error){
                            console.error(error);
                            window.alert("Check out failed ! Please try again later !")
                        }
                    }
                }

            }
        }
    }
    return(
        <div className={styles.myDiv} >
            <h1>Check In and Out</h1>
            <select value={roomNumber} onChange={handleRoomNumber} required >
                <option value="" >Room Number</option>
                {myRooms.map((room, index)=>{
                    const roomCapacity = room.SharingType;
                    const occupied = (myTenants.filter((tenant)=> tenant.RoomNumber === room.RoomNumber && tenant.Status === "Active").length);
                    const remaining = Number(roomCapacity) - Number(occupied);
                    if(remaining >= 1){
                        return(<option value={room.RoomNumber} key={index} >{`${room.RoomNumber}`} - {`${remaining} Slots Left`}</option>)
                    }
                })}
            </select>
            <input value={idNumber} onChange={handleIDNumber} type="number" placeholder="Enter ID Number" min={10000000}/>
            <div className={styles.buttonContainer}>
                <button onClick={handleCheckIn}>Check In</button>
                <button onClick={handleCheckOut}>Check Out</button>
            </div>
        </div>
    );
}

export default Tracking;

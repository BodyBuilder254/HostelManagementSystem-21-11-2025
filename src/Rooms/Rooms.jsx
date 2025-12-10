 
import styles from "./Rooms.module.css";
import React, {useState, useEffect} from "react";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {database} from "../Config/Firebase.js";
import {collection, doc, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";

function Rooms(){

    //BE CAREFUL const [myRooms, setMyRooms] = useState(JSON.parse(localStorage.getItem("20251112MyRooms")) || []);
    //BE CAREFUL const [myTenants, setMyTenants] = useState(JSON.parse(localStorage.getItem("20251110MYTenants")) || []);
    const [myRooms, setMyRooms] = useState([]);
    const [myTenants, setMyTenants] = useState([]);

    useEffect(()=>{
        // localStorage.setItem("20251112MyRooms", JSON.stringify(myRooms)) BE CAREFUL;
        document.title = "Rooms";
        fetchRooms();
        fetchTenants();
    }, []);

    const [roomNumber, setRoomNumber] = useState("");
    const [floorNumber, setFloorNumber] = useState("");
    const [sharingType, setSharingType] = useState("");
    const [gender, setGender] = useState("");
    const [monthlyCharges, setMonthlyCharges] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState(null); 
    const [editIndex, setEditIndex] = useState(null);
    
    const roomsCollection = collection(database, "Rooms");
    const tenantsCollection = collection(database, "Tenants");

    function handleRoomNumber(event){
        setRoomNumber(event.target.value);
    }
    function handleFloorNumber(event){
        setFloorNumber(event.target.value);
    }
    function handleSharingType(event){
        setSharingType(event.target.value);
    }
    function handleGender(event){
        setGender(event.target.value);
    }
    function handleMonthlyCharges(event){
        setMonthlyCharges(event.target.value);
    }
    function handleSearchTerm(event){
        setSearchTerm(event.target.value);
    }

    async function fetchRooms(){
        try{
            const querySnapshot = getDocs(roomsCollection);
            const roomsData = (await querySnapshot).docs.map((doc) => ({id: doc.id, ...doc.data()}));
            setMyRooms(roomsData);

        }catch(error){
            console.error(error);
            window.alert("Failed to load Rooms data");
        }
    }

    async function fetchTenants(){
        try{
            const querySnapshot = getDocs(tenantsCollection);
            const tenantsData = (await querySnapshot).docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyTenants(tenantsData);
        }catch(error){
            console.error(error);
            window.alert("Failed to Load Tenants Data !");
        }
    }

    function handleSearch(){
        const foundRoom = myRooms.find((room) => room.RoomNumber === searchTerm);

        if(!foundRoom){
            window.alert("No Such Room !");
        }
        else if(foundRoom){
            setSearchResult(foundRoom);
        }
    }

    function handleReset(){
        setSearchTerm("");
        setSearchResult(null);
    }

    function handleEdit(index){

        const roomToEdit = myRooms[index];

        setRoomNumber(roomToEdit.RoomNumber);
        setFloorNumber(roomToEdit.FloorNumber);
        setSharingType(roomToEdit.SharingType);
        setGender(roomToEdit.Gender);
        setMonthlyCharges(roomToEdit.MonthlyCharges);
        
        setEditIndex(index);
    }

    async function handleDelete(roomId){
        const confirmDelete = window.confirm("Confirm you want to delete this room");
        if(!confirmDelete){
            window.alert("Deletion cancelled");
        }
        else if(confirmDelete){
            try{
                const roomDoc = doc(database, "Rooms", roomId);
                await deleteDoc(roomDoc);
                await fetchRooms();
                window.alert("Deleted successfully");
            }catch(error){
                console.error(error);
                window.alert("Deletion operion has failed ! try again later");
            }
        }
    }

    async function handleAddRoom(event){
        event.preventDefault();

        const myRoom = {RoomNumber: roomNumber, FloorNumber: floorNumber, SharingType: sharingType,
            Gender: gender, MonthlyCharges: monthlyCharges, 
        }

        try{
            if(editIndex !== null){


                const roomId = myRooms[editIndex].id;
                const roomDoc = doc(database, "Rooms", roomId);
                await updateDoc(roomDoc, myRoom);

                await fetchRooms();
                window.alert("Room Edited Successfully");
                setEditIndex(null);
                resetFormFields();
            }

            else if(editIndex === null){
                const isDuplicate = myRooms.some((room) => room.RoomNumber === roomNumber);
                if(isDuplicate){
                    window.alert("The room already exists !");
                }
                else if(!isDuplicate){
                   await addDoc(roomsCollection, myRoom);
                   await fetchRooms();

                    window.alert("Room added successfully !");
                    resetFormFields();
                }
            }
        }catch(error){
            console.error(error);
            signInWithEmailAndPassword.alert("failed to save Room data !");
        }

        
    }

    function resetFormFields(){
        setRoomNumber("");
        setFloorNumber("");
        setSharingType("");
        setGender("");
        setMonthlyCharges("");
    }

    function exportCSV(){
        if(!myRooms || myRooms.length === 0){
            window.alert("No Rooms data to export");
        }
        else{

            // Define CSV Headers
            const headers = ["Room Number", "Floor Number", "Sharing Type", "Gender", "Monthly Charges", "Vacancy"]
            
            // Build CSV Rows
            const rows = myRooms.map(room => {
                const cleanedMonthlyCharges = String(room.MonthlyCharges).replace(",", "");

                const roomCapacity = room.SharingType;
                const occupied = myTenants.filter((tenant) => tenant.RoomNumber === room.RoomNumber).length;
                const remaining = roomCapacity - occupied;

                const vacancy = remaining > 0 ? `${remaining}  Slots` : "Full";

                return[
                    room.RoomNumber,
                    room.FloorNumber,
                    `${room.SharingType}  Sharing`,
                    room.Gender,
                    `"KSH  ${room.MonthlyCharges}"`,
                    vacancy
                ].join(",") //Join Values with Comma
            });

            // Combine Header with Rows
            const csvContent = [headers.join(","), ...rows].join("\n");

            // Create a Blob and Download
            const blob = new Blob([csvContent], {type: "text/csv"});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Rooms_Data.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }
    }
    function exPortPDF(){
        if(!myRooms || myRooms.length === 0){
            window.alert("NO Room data to Export");
        }
        else{
            const pdf = new jsPDF();

            // Title
            pdf.setFontSize(16);
            pdf.text("ROOMS DATA EXPORT", 14, 15);

            // Build the Table Data
            const tableColumns = ["Room Number", "Floor Number", "Sharing Type", "Gender", "Monthly Charges", "Vacancy"];
            const tableRows = [];

            myRooms.forEach((room, index)=>{

                const roomCapacity = Number(room.SharingType);

                const occupied = myTenants.filter((tenant)=> tenant.RoomNumber === room.RoomNumber).length;
                const remaining = roomCapacity - occupied;
                const vacancy = remaining > 0 ? `${remaining}  Slots` : "Full";

                tableRows.push([
                    room.RoomNumber,
                    room.FloorNumber,
                    `${room.SharingType}  Sharing`,
                    room.Gender,
                    `KSH ${room.MonthlyCharges}`,
                    vacancy
                ]);
            });

            // Add the Table to the PDF
            autoTable(pdf, {
                head: [tableColumns],
                body: tableRows,
                startY: 25,
                styles: {
                    fontSize: 14,
                    align: "center"
                }, 
                headStyles: {
                    filColor: [100, 149, 237],
                    textColor: [255, 255, 255]
                }
            });

            // Save the PDF
            pdf.save("Rooms_Data.pdf");

        }
    }
    return(
        <div className={styles.myContainer} >
            <h1>New Rooms Addition</h1>
            <form className={styles.myForm} onSubmit={handleAddRoom} >
                <input type="text" placeholder="Enter Room Number" value={roomNumber} onChange={handleRoomNumber} required/>
                <select required value={floorNumber} onChange={handleFloorNumber}>
                    <option value="">Select the Floor</option>
                    <option value="Ground Floor" >Ground Floor</option>
                    <option value="First Floor" >First Floor</option>                   
                </select>
                <select required value={sharingType} onChange={handleSharingType}>
                    <option value="" >Type of Sharing</option>
                    <option value="1" >1</option>
                    <option value="2" >2</option>
                    <option value="4" >4</option>
                    <option value="6" >6</option>
                    <option value="8" >8</option>
                    <option value="10" >10</option>
                </select>
                <div>
                    <input value="Male" type="radio" name="gender" onChange={handleGender} checked={gender === "Male"} required />
                    <label>Male</label> <br/>
                    <input value= "Female" type="radio" name="gender" onChange={handleGender} checked={gender === "Female"} required />
                    <label>Female</label>
                </div>
                <select required value={monthlyCharges} onChange={handleMonthlyCharges} >
                    <option value= "" >Monthly Charges</option>
                    <option value= "15,000">15,000</option>
                    <option value= "10,000">10,000</option>
                    <option value= "9,500" >9,500</option>
                    <option value= "9,000" >9,000</option>
                    <option value= "8,500" >8,500</option>
                    <option value= "8,000" >8,000</option>
                    <option value= "7,500" >7,500</option>
                    <option value= "7,000" >7,000</option>
                    <option value= "6,500" >6,500</option>
                    <option value= "6,000" >6,000</option>
                </select>
                <button type="submit">Add Room</button>
            </form>

            <div className= {styles.searchTab} >
                <input type="text" placeholder="Enter Room Number" value={searchTerm} onChange={handleSearchTerm} />
                <button className={styles.searchButton} onClick={handleSearch} >Search</button>
                <button className={styles.resetButton} onClick={handleReset} >Reset</button>
            </div>
            <div className={styles.myExport} >
                <button className={styles.searchButton} onClick={exportCSV} >Export CSV</button>
                <button className={styles.resetButton} onClick={exPortPDF} >Export PDF</button>
            </div>
            <table className={styles.myTable}>
                <thead>
                    <tr>
                        <th>Room Number</th>
                        <th>Floor Number</th>
                        <th>Sharing Type</th>
                        <th>Gender</th>
                        <th>Monthly Charges</th>
                        <th>Vacancy</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {(searchResult ? [searchResult] : myRooms)?.map((room, index)=>{
                        const roomIndex = myRooms.findIndex((r)=> r.RoomNumber === room.RoomNumber );
                        const roomCapacity = room.SharingType;
                        const occupied = myTenants.filter((tenant)=> tenant.RoomNumber === room.RoomNumber && tenant.Status === "Active").length;
                        const remaining = Number(roomCapacity) - Number(occupied);
                    return(<tr key={index} >
                        <td>{room.RoomNumber} </td>
                        <td>{room.FloorNumber} </td>
                        <td>{room.SharingType} Sharing </td>
                        <td>{room.Gender} </td>
                        <td>{room.MonthlyCharges} </td>
                        <td>{remaining > 0 ? `${remaining} Slots` : "Full" }</td>
                        <td><button className={styles.editButton} onClick={() => handleEdit(roomIndex)} >Edit</button></td>
                        <td><button className={styles.deleteButton} onClick={()=> handleDelete(room.id)} >Delete</button></td>
                    </tr>)})}
                </tbody>
            </table>
        </div>
    );
}
export default Rooms;

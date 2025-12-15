
import React, {useState, useEffect} from "react";
import styles from "./Tenants.module.css";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { auth, database } from "../Config/Firebase.js";
import {collection, getDocs, doc, addDoc, updateDoc, deleteDoc} from "firebase/firestore";

function Tenants(){

    const tenantsCollection = collection(database, "Tenants");
    const roomsCollection = collection(database, "Rooms");

    const [idNumber, setIDNumber] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    // const [entryDate, setEntryDate] = useState("");
    const [gender, setGender] = useState("");

    const [editIndex, setEditIndex] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState(null);

    // BE CAREFUL const [myRooms, setMyRooms] = useState(JSON.parse(localStorage.getItem("20251112MyRooms")) || []);
    const [myTenants, setMyTenants] = useState([]);
    const [myRooms, setMyRooms] = useState([]);

    useEffect(()=>{
        document.title = "Tenants";
        fetchTenants();
        fetchRooms();
        document.title= "TenantsPage";
    }, []);

    async function fetchTenants(){
        try{
            const querySnapshot = getDocs(tenantsCollection);
            const tenantsData = (await querySnapshot).docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyTenants(tenantsData);
        }catch(error){
            console.error(error);
            window.alert("Failed to load tenants data");
        }
    }

    async function fetchRooms(){
        try{
            const querySnapshot = await getDocs(roomsCollection);
            const roomsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyRooms(roomsData);
        }catch(error){
            console.error(error);
            window.alert("Failed to load Rooms data");
        }
    }

    function handleIDNumber(event){
        setIDNumber(event.target.value);
    }
    function handlePhoneNumber(event){
        setPhoneNumber(event.target.value);
    }
    function handleFirstName(event){
        setFirstName(event.target.value);
    }
    function handleLastName(event){
        setLastName(event.target.value);
    }
    // function handleEntryDate(event){
    //     setEntryDate(event.target.value);
    // }
    function handleGender(event){
        setGender(event.target.value);
    }
    function resetFormFields(){
        setIDNumber("");
        setPhoneNumber("");
        setFirstName("");
        setLastName("");
        // setEntryDate("");
        // setRoomNumber("");
        setGender("");
    }

    async function handleAddCustomer(event){
        event.preventDefault();
        if(idNumber.length !== 8){
            window.alert("Enter valid ID number");
        }
        else if(!(phoneNumber.startsWith(254)) || phoneNumber.length !== 12){
            window.alert("Phone must start with '254' ");
        }
        else if(firstName.length < 3 || lastName.length < 3){
            window.alert("Enter valid name");
        }
        else{
            const newCustomer = {
                IDNumber: idNumber, PhoneNumber: phoneNumber ,FirstName: firstName, LastName: lastName,
                Gender: gender, Status: "Away",
            }

            try{
                if(editIndex !== null){
                    // Update in Firestore
                    const tenantId = myTenants[editIndex].id;
                    const tenantDoc = doc(database, "Tenants", tenantId);
                    await updateDoc(tenantDoc, newCustomer);

                    await fetchTenants();
                    setEditIndex(null);
                    window.alert("Tenant details updated successfully!");
                    resetFormFields();
                }

                else{

                    const isDuplicate = myTenants.some((tenant) => 
                        tenant.IDNumber === idNumber || tenant.PhoneNumber === phoneNumber
                    );

                    if(isDuplicate){
                    window.alert("A tenant with this ID or phone number already exists!");
                    }
                    else{
                        // Add Document to Firestore
                        await addDoc(tenantsCollection, {...newCustomer, EntryDate: (new Date().toISOString().split("T")[0]), 
                            userId: auth.currentUser.uid
                        });
                        await fetchTenants();

                        window.alert("Tenant added successfully!")
                        resetFormFields();
                    }
                }
            }catch(error){
                console.error(error);
                window.alert("Failed to save tenant data");
            }
            

        }
    }

    function handleEditTenant(index){
        const tenantToEdit = myTenants[index];

        setIDNumber(tenantToEdit.IDNumber);
        setPhoneNumber(tenantToEdit.PhoneNumber);
        setFirstName(tenantToEdit.FirstName);
        setLastName(tenantToEdit.LastName);
        // setEntryDate(tenantToEdit.EntryDate);
        setGender(tenantToEdit.Gender);
        // setMonthlyCharges(tenantToEdit.MonthlyCharges);

        setEditIndex(index);

    }

    async function deleteCustomer(tenantId){
        const confirmDelete = window.confirm("Are you sure you want to delete this tenant?");

        if(confirmDelete){
            try{
                const tenantDoc = doc(database, "Tenants", tenantId);
                await deleteDoc(tenantDoc);

                // setMyTenants(updatedCustomers);
                window.alert("Tenant deleted successfully");
                await fetchTenants();
            }catch(error){
                console.error(error);
            }
        }
        else{
            window.alert("Deletion Cancelled");
        }
        
    }

    function handleSearchTerm(event){
        setSearchTerm(event.target.value);
    }
    function handleSearch(){
        if(searchTerm.length < 8 || searchTerm.length > 12){
            window.alert("Enter valid Phone or ID Number");
        }
        else{
        const foundTenant = myTenants.find((tenant)=> 
            tenant.IDNumber === searchTerm || tenant.PhoneNumber === searchTerm);
        if(foundTenant){
            setSearchResult(foundTenant);
        }
        else{
            window.alert("No tenant found with that ID or phone number");
            setSearchResult(null);
        }}

    }
    function handleReset(){
        setSearchTerm("");
        setSearchResult(null);
    }

    function handleExportCSV(){
        
        if(!myTenants || myTenants.length === 0){
            window.alert("No tenant data available to export.");
        }
        else{
            // Extract Headers Dynamically
            const headers = Object.keys(myTenants[0]);
            const csvRows = [];

            // Add Headers
            csvRows.push(headers.join(","));

            // Add Each Tenant's Data Row
            myTenants.forEach((tenant) => {
                const values = headers.map((header) => {
                    // Escape Commas and Quotes Properly
                    const escaped = String(tenant[header]).replace(/"/g,'""');
                    return `"${escaped}"`
                });
                csvRows.push(values.join(","));
            });

            // Create CSV String
            const csvString = csvRows.join("\n");

            // Create Downloadable blob
            const blob = new Blob([csvString], {type: "text/csv"});
            const url = URL.createObjectURL(blob);

            // Create Download Link
            const link = document.createElement("a");
            link.href = url;
            link.download = "Tenants_Data.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }
    }

    function handleExportPDF(){
        if(!myTenants || myTenants.length === 0){
            window.alert("No tenant data to export");
        }
        else{
            const pdf = new jsPDF();
            pdf.setFontSize(16);
            pdf.setFont("helvetica", "bold");
            pdf.text("TENANT RECORDS", 14, 10);
            autoTable(pdf, {
                startY: 20, 
                head: [Object.keys(myTenants[0])],
                body: myTenants.map((tenant)=> Object.values(tenant))
            });
            pdf.save("tenants_data.pdf");
        }
    }

    return(
        <div className={styles.container} >
            <h1>New Tenants Registration</h1>

            <form className={styles.myForm} onSubmit={handleAddCustomer} >
                <div className={styles.formRow}>
                    <input type="number" placeholder="ID Number" value={idNumber} onChange={handleIDNumber} required/><br/>
                    <input type="number" placeholder="Phone Number" value={phoneNumber} onChange={handlePhoneNumber} required/><br/>
                </div>
                <div className={styles.formRow}>
                    <input type="text" placeholder="First Name" value={firstName} onChange={handleFirstName} required/><br/>
                    <input type="text" placeholder="Last Name" value={lastName} onChange={handleLastName} required /><br />
                </div>
                {/* <div className={styles.formGroup}>
                    <label>Entry Date</label>
                    <input type="date" value={entryDate} onChange={handleEntryDate} required /><br/>
                </div> */}
                <div>
                    <input value="Male" type="radio" name="gender" checked={gender === "Male"} onChange={handleGender} required />
                    <label>Male</label>
                    <input value="Female" type="radio" name="gender" checked={gender === "Female"} onChange={handleGender} required />
                    <label>Female</label> <br />
                </div>

                <button type="submit" >Add Customer</button>

            </form>

            <div className={styles.searchBar} >
                <input type="number" value={searchTerm} onChange={handleSearchTerm} placeholder="Enter ID or Phone Number" />
                <button className={styles.editButton} onClick={handleSearch} >Search</button>
                <button className={styles.deleteButton} onClick={handleReset} >Reset</button>
            </div>

            <div className={styles.exportControls} >
                <button onClick={handleExportCSV} >Export CSV</button>
                <button onClick={handleExportPDF} >Export PDF</button>
            </div>
            
            <div className={styles.tableContainer} >
            <table className={styles.myTable} >
                <thead>
                    <tr>
                        <th>ID Number</th>
                        <th>Phone Number</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Entry Date</th>
                        <th>Room Number</th>
                        <th>Gender</th>
                        <th>Monthly Charges</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>

                <tbody>
                    {(searchResult ? [searchResult] : myTenants)?.map((tenant, index) =>{ 
                        const tenantIndex = myTenants.findIndex((t) => t.IDNumber === tenant.IDNumber );
                  return(  <tr key={index}>
                        <td>{tenant.IDNumber} </td>
                        <td>{tenant.PhoneNumber} </td>
                        <td>{tenant.FirstName} </td>
                        <td>{tenant.LastName} </td>
                        <td>{tenant.EntryDate || "NA"} </td>
                        <td>{tenant.RoomNumber || "NA"} </td>
                        <td>{tenant.Gender} </td>
                        {tenant.RoomNumber ? myRooms.map((room, index)=> {if(room.RoomNumber === tenant.RoomNumber){
                            return <td key={index} >{room.MonthlyCharges} </td>
                        }}) : <td>{"NA"} </td> }                   
                        <td><button onClick={()=> handleEditTenant(tenantIndex)} className={styles.editButton} >Edit</button> </td>
                        <td><button onClick={()=>deleteCustomer(tenant.id)} className={styles.deleteButton} >Delete</button></td>
                    </tr>)}
                    )}
                </tbody>

            </table>
            </div>
        </div>
    );
}
export default Tenants;


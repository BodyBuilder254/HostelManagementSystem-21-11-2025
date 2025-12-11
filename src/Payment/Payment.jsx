import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import styles from "./Payment.module.css";
import React, {useState, useEffect} from "react";

import { database } from "../Config/Firebase";
import { collection,getDocs, doc, updateDoc } from "firebase/firestore";

function Payment(){


    //OLD SYSTEM const [myTenants, setMyTenants] = useState(JSON.parse(localStorage.getItem("20251110MYTenants")) || []);
    const [myTenants, setMyTenants] = useState([]);
    const [idNumber, setIDNumber] = useState("");
    const [qrCode, setQRCode] = useState("");
    const [amountPaid, setAmountPaid] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [monthPaidFor, setMonthPaidFor] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredTenants, setFilteredTenants] = useState([]);

    const tenantsCollection = collection(database, "Tenants");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(()=>{
        //OLD SYSTEM localStorage.setItem("20251110MYTenants", JSON.stringify(myTenants));
        fetchTenants();
        document.title = "PayamentsPage";
    }, []);

    useEffect(()=>{
        const myFilteredTenants = myTenants.filter((tenant) => {
            const myTotalPaid = totalPaid(tenant.PaymentHistory);
            const myTotalCharges = totalCharges(tenant.StayHistory);
            const myBalance = myTotalPaid - myTotalCharges;

            switch(searchTerm){
                case "cleared":
                    return myBalance === 0;
                case "pending":
                    return myBalance < 0;
                case "overPaid":
                    return myBalance > 0;
                default :
                    return true;
            }
        })
        setFilteredTenants(myFilteredTenants);
        setIsLoading(false);

    }, [searchTerm, myTenants.length])

    function handleIDNumber(event){
        setIDNumber(event.target.value);
    }
    function handleQRCode(event){
        setQRCode(event.target.value);
    }
    function handleAmountPaid(event){
        setAmountPaid(Number(event.target.value));
    }
    function handlePaymentDate(event){
        setPaymentDate(event.target.value);
    }
    function handleMonthPaidFor(event){
        setMonthPaidFor(event.target.value);
    }
    function handlePaymentMethod(event){
        setPaymentMethod(event.target.value);
    }

    async function fetchTenants(){
        try{
            const querySnapshot = await getDocs(tenantsCollection);
            const tenantsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            setMyTenants(tenantsData);
        }catch(error){
            console.error(error);
            window.alert("Failed to load data ! Please try again later");
        }
    }

    function handleClearForm(){
        setIDNumber("");
        setQRCode("");
        setAmountPaid("");
        setPaymentDate("");
        setMonthPaidFor("");
        setPaymentMethod("");

    }
    function totalPaid(paymentHistory = []){
        let total = 0;

        paymentHistory.forEach(payment =>{
            const amountPaid = Number(payment.AmountPaid) || 0;
            total += amountPaid;
        });

        return total;
    }
    function totalCharges(stayHistory = []){
        let total = 0;

        stayHistory.forEach((stay => {
            const start = new Date(stay.StartDate);
            const end = stay.EndDate ? new Date(stay.EndDate) : new Date();

            const months = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth() )

            const monthlyCharges = Number(stay.MonthlyCharges) || 0;

            total += (months * monthlyCharges);
        }));

        return total;
    }

    async function handleSubmit(event){
        event.preventDefault();

        if(idNumber.length !== 8){
            return window.alert("Enter valid ID Number !");
        }
        else if(qrCode.length <= 5){
            return window.alert("Enter valid QRCode");
        }
        else if(amountPaid < 1000){
            return window.alert("Minimum Allowed Amount is KSH  1,000");
        }
        // Continue AFter Validation of Inputs
        else{
            const tenantsCopy = [...myTenants];
            const tenantIndex = tenantsCopy.findIndex(tenant => tenant.IDNumber === idNumber);
            if(tenantIndex === -1){
                return window.alert("This tenant does not exist");
            }
            // Continue After Confirming The Tenant Exists
            else{try{
                const tenant = tenantsCopy[tenantIndex];
                if(!tenant.PaymentHistory){
                    tenant.PaymentHistory = [];
                }

                tenant.PaymentHistory.push({
                    QRCode: qrCode,
                    AmountPaid: amountPaid,
                    Date: paymentDate,
                    MonthPaidFor: monthPaidFor,
                    PaymentMethod: paymentMethod,
                });

                const tenantId = tenantsCopy[tenantIndex].id;
                const tenantDoc = doc(database, "Tenants", tenantId);
                await updateDoc(tenantDoc, tenant);
                await fetchTenants();

                window.alert("Payment Recorder Successfully !");
                handleClearForm();
            }catch(error){
                console.error(error);
                window.alert("Failed to update data ! please try again later !");
            }}
        }
        
    }

    function handleCleared(){
        setSearchTerm("cleared");
    }
    function handlePending(){
        setSearchTerm("pending")
    }
    function handleOverPaid(){
        setSearchTerm("overPaid");
    }
    function handleReset(){
        setSearchTerm("");
    }

    function handleExportCSV(){
        // Get all tenants from localStorage (not filtered)
        // const allTenants = JSON.parse(localStorage.getItem("20251110MYTenants")) || [];
        
        // Create CSV header row with exact column names as in table
        const headers = ["IDNumber", "PhoneNumber", "FirstName", "LastName", "TotalPaid", "TotalCharges", "Balance"];
        
        // Start with header row
        let csvContent = headers.join(",") + "\n";
        
        // Process each tenant and add to CSV
        myTenants.forEach(tenant => {
            // Calculate the same fields as displayed in table
            const myTotalPaid = totalPaid(tenant.PaymentHistory);
            const myTotalCharges = totalCharges(tenant.StayHistory);
            const tenantBalance = myTotalPaid - myTotalCharges;
            
            // Create row data in same order as headers
            const rowData = [
                tenant.IDNumber,
                tenant.PhoneNumber,
                tenant.FirstName,
                tenant.LastName,
                myTotalPaid,           // Calculated field
                myTotalCharges,        // Calculated field
                tenantBalance          // Calculated field
            ];
            
            // Add row to CSV content
            csvContent += rowData.join(",") + "\n";
        });
        
        // Create filename with current date
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const filename = `Hostel-Payments-${currentDate}.csv`;
        
        // Create download link and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
    }
    function handleExportPDF(){
        // Get all tenants from localStorage (not filtered)
        // const allTenants = JSON.parse(localStorage.getItem("20251110MYTenants")) || [];
        
        // We'll use jsPDF and jspdf-autotable libraries - you need to install them first
        // npm install jspdf jspdf-autotable
        
        // Import the libraries (you need to install them first)
        
        // Create new PDF document
        const doc = new jsPDF();
        
        // Set document title
        doc.text('Hostel Payments Report', 14, 15);
        
        // Prepare table data
        const tableData = myTenants.map(tenant => {
            // Calculate the same fields as displayed in table
            const myTotalPaid = totalPaid(tenant.PaymentHistory);
            const myTotalCharges = totalCharges(tenant.StayHistory);
            const tenantBalance = myTotalPaid - myTotalCharges;
            
            // Return row data in same order as table columns
            return [
                tenant.IDNumber,
                tenant.PhoneNumber,
                tenant.FirstName,
                tenant.LastName,
                myTotalPaid.toLocaleString(),     // Format numbers with commas
                myTotalCharges.toLocaleString(),  // Format numbers with commas
                tenantBalance.toLocaleString()    // Format numbers with commas
            ];
        });
        
        // Define table columns (headers)
        const headers = [
            ['ID Number', 'Phone Number', 'First Name', 'Last Name', 'Total Paid', 'Total Charges', 'Balance']
        ];
        
        // Create the table in PDF
        autoTable(doc,{
            head: headers,
            body: tableData,
            startY: 20, // Start below the title
            styles: { fontSize: 8 }, // Smaller font to fit all columns
            headStyles: { fillColor: [66, 135, 245] } // Blue header
        });
        
        // Create filename with current date and save PDF
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Hostel-Payments-${currentDate}.pdf`;
        doc.save(filename);
    }


    return(
        <div className={styles.myContainer} >
            <h1>Payments Recording</h1>
            <form className={styles.myForm} onSubmit={handleSubmit} >
                <input type="number" value={idNumber} onChange={handleIDNumber} placeholder="Enter ID Number" required />
                <input type="text" value={qrCode} onChange={handleQRCode} placeholder="Transaction ID" required />  
                <input type="number" value={amountPaid} onChange={handleAmountPaid} placeholder="Amount Paid" required />  
                <div>
                    <label>Date of Payment</label>
                    <input type="date" value={paymentDate} onChange={handlePaymentDate} /> 
                </div>
                                <div>
                    <label>Rent is for which Month</label>
                    <input type="month" value={monthPaidFor} onChange={handleMonthPaidFor} required/>
                </div>            
                <select value={paymentMethod} onChange={handlePaymentMethod} required>
                    <option value="" >Payment Method</option>
                    <option value="MpesaPaybill">Mpesa Paybill</option>
                    <option value="McollectionAccount" >Mcollection Account</option>
                    <option value="SendMoney" >Send Money</option>
                    {/* <option value="CashPayment" >Cash Payment</option> */}
                </select>
                <button type="submit">Submit Payment</button>
            </form>

            <div className={styles.filtering} >
                <button onClick={handleCleared} >Cleared</button>
                <button onClick={handlePending} >Pending</button>
                <button onClick={handleOverPaid} >OverPaid</button>
                <button onClick={handleReset} >Reset</button>
            </div>

            <div className={styles.export} >
                <button onClick={handleExportCSV} >ExPort CSV</button>
                <button onClick={handleExportPDF} >ExPort PDF</button>
            </div>

            <div className={styles.tableContainer}>
            <table className={styles.myTable} >
                <thead>
                    <tr>
                        <th>ID Number</th>
                        <th>Phone Number</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Total Paid</th>
                        <th>Total Charges</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTenants.map((tenant, index) => {
                        const myTotalPaid = totalPaid(tenant.PaymentHistory);
                        const myTotalCharges = totalCharges(tenant.StayHistory);
                        const tenantBalance = myTotalPaid - myTotalCharges;
                        
                        return(
                            <tr key={index} >
                                <td>{tenant.IDNumber} </td>
                                <td>{tenant.PhoneNumber} </td>
                                <td>{tenant.FirstName} </td>
                                <td>{tenant.LastName} </td>
                                <td>{myTotalPaid.toLocaleString()} </td>
                                <td>{myTotalCharges.toLocaleString()} </td>
                                <td>{tenantBalance.toLocaleString()} </td>
                            </tr>
                        )})
                    }
                </tbody>
            </table>
            </div>
        </div>
    );
}
export default Payment;

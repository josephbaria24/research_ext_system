


// import React, { useState, useEffect } from "react";
// import { db } from "../../firebase";
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { ToastContainer } from 'react-toastify';
// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   deleteDoc,
//   doc,
// } from "firebase/firestore";
// import { FiTrash, FiPlus, FiEdit,FiSave  } from "react-icons/fi";

// const TransactionHistory = ({ darkMode }) => {
//   const [transactions, setTransactions] = useState([]);
//   const [editId, setEditId] = useState(null);
//   const [editableTransaction, setEditableTransaction] = useState({});
//   const [startDate, setStartDate] = useState(new Date());
//   const [filteredTransactions, setFilteredTransactions] = useState([]);
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("date");
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [newTransaction, setNewTransaction] = useState({
//     date: "",
//     time: "",
//     items: "",
//     from: "",
//     to: "",
//     controlNumber: "",
//     transactionType: "Outgoing"
//   });

//   const transactionsCollectionRef = collection(db, "transactions");

//   const fetchTransactions = async () => {
//     const data = await getDocs(transactionsCollectionRef);
//     // Sort the transactions by date in descending order
//     const sortedTransactions = data.docs
//       .map((doc) => ({ ...doc.data(), id: doc.id }))
//       .sort((a, b) => new Date(b.date) - new Date(a.date));  // Sorting by date in descending order
//     setTransactions(sortedTransactions);
//   };
  

//   useEffect(() => {
//     fetchTransactions();
//   }, []);



//   const handleDoubleClick = (transaction) => {
//     setEditId(transaction.id);
//     setEditableTransaction(transaction); // Set current row data in state
//   };

//   const handleChange = (e, field) => {
//     setEditableTransaction((prev) => ({ ...prev, [field]: e.target.value }));
//   };

//   const saveTransaction = async () => {
//     if (!editId) return;
  
//     const transactionRef = doc(db, "transactions", editId);
    
//     await updateDoc(transactionRef, {
//       ...editableTransaction,
//       items: typeof editableTransaction.items === "string" ? editableTransaction.items.split(",") : editableTransaction.items, 
//     });
  
//     setEditId(null);
//     fetchTransactions();
//   };

//   const predefinedFromOptions = [
//     "VPEC",
//     "BUDGET",
//     "ADMIN",
//     "OUP",
//     "OVP",
//     "ACCOUNTING",
//     "RECORDS",
//     "REGISTRAR"
//   ];

//   const predefinedToOptions = [
//     "VPEC",
//     "BUDGET",
//     "ADMIN",
//     "OUP",
//     "OVP",
//     "ACCOUNTING",
//     "RECORDS",
//     "REGISTRAR"
//   ];


//   const addTransaction = async () => {
//     if (!newTransaction.date || !newTransaction.time || !newTransaction.items || !newTransaction.from || !newTransaction.to || !newTransaction.controlNumber) {
//       toast.error("Please fill all fields!"); // Failure toast
//       return;
//     }
  
//     try {
//       // Check if controlNumber already exists
//       const data = await getDocs(transactionsCollectionRef);
//       const existingControlNumbers = data.docs.map(doc => doc.data().controlNumber);
  
//       if (existingControlNumbers.includes(newTransaction.controlNumber)) {
//         toast.error("Control number already exists! Please use a unique control number."); // Validation toast
//         return;
//       }
  
//       // Add the new transaction if control number is unique
//       await addDoc(transactionsCollectionRef, {
//         date: newTransaction.date,
//         time: newTransaction.time,
//         items: newTransaction.items.split(","),
//         from: newTransaction.from,
//         to: newTransaction.to,
//         controlNumber: newTransaction.controlNumber,
//         transactionType: newTransaction.transactionType,
//       });
  
//       setNewTransaction({ date: "", time: "", items: "", from: "", to: "", controlNumber: "", transactionType: "Outgoing" });
//       fetchTransactions();
//       toast.success("Transaction added successfully!"); // Success toast
//     } catch (error) {
//       toast.error("Error adding transaction! Please try again."); // Error toast
//     }
//   };
  
  

//   const updateTransaction = async () => {
//     if (!editId) return;

//     const transactionRef = doc(db, "transactions", editId);
//     await updateDoc(transactionRef, {
//       date: newTransaction.date,
//       time: newTransaction.time,
//       items: newTransaction.items.split(","),
//       from: newTransaction.from,
//       to: newTransaction.to,
//       controlNumber: newTransaction.controlNumber,
//       transactionType: newTransaction.transactionType,
//     });

//     setNewTransaction({ date: "", time: "", items: "", from: "", to: "" });
//     setEditId(null);
//     fetchTransactions();
//   };

//   const deleteTransaction = async (id) => {
//     await deleteDoc(doc(db, "transactions", id));
//     fetchTransactions();
//   };

//   const cancelEdit = () => {
//     setNewTransaction({ date: "", time: "", items: "", from: "", to: "" });
//     setEditId(null);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault(); // Prevent form submission or new line
//       editId ? updateTransaction() : addTransaction();
//     }
//   };
  

//   const addShortcutItem = (item) => {
//     setNewTransaction((prev) => ({
//       ...prev,
//       items: prev.items ? `${prev.items}, ${item}` : item,
//     }));
//   };

//   useEffect(() => {
//     let filtered = transactions.filter((t) =>
//       Object.values(t).some((val) => val.toString().toLowerCase().includes(search.toLowerCase()))
//     );
//     filtered = filtered.slice(0, 50);
//     setFilteredTransactions(filtered);
//   }, [search, transactions]);

//   const handleSort = (key) => {
//     const order = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
//     setSortBy(key);
//     setSortOrder(order);
  
//     const sorted = [...filteredTransactions].sort((a, b) => {
//       if (key === "time") {
//         const dateA = new Date(`1970-01-01T${a[key]}`);
//         const dateB = new Date(`1970-01-01T${b[key]}`);
//         return order === "asc" ? dateA - dateB : dateB - dateA;
//       } else {
//         return order === "asc"
//           ? a[key].toString().localeCompare(b[key].toString())
//           : b[key].toString().localeCompare(a[key].toString());
//       }
//     });
  
//     setFilteredTransactions(sorted);
//   };


//   const formatTimeTo12Hour = (time) => {
//     if (!time) return "";
//     const [hours, minutes] = time.split(":").map(Number);
//     const period = hours >= 12 ? "PM" : "AM";
//     const formattedHours = hours % 12 || 12; // Convert 0-23 to 12-hour format
//     return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
//   };
  



//   const handleTodayClick = () => {
//     const today = new Date();
//     const currentDate = today.toISOString().split("T")[0]; // Extracts the date in 'yyyy-mm-dd' format
//     const currentTime = today.toTimeString().split(" ")[0]; // Extracts the time in 'hh:mm:ss' format
//     setNewTransaction({
//       ...newTransaction,
//       date: currentDate,
//       time: currentTime.slice(0, 5), // Only take hours and minutes
//     });
//   };

  
//   return (
//     <div className={`w-full p-6 min-h-screen rounded transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-black"}`}>
//       <h2 className="text-3xl font-bold mb-4 text-center">Transaction History</h2>
  
//       {/* Add/Edit Transaction Form */}
//       <div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
//         <h3 className="text-xl font-semibold mb-2">{editId ? "Edit Transaction" : "Add Transaction"}</h3>
//         <div className="grid grid-cols-2 gap-4">
//         <div className="flex items-center space-x-4">
//       {/* Date Input */}
//       <div className="relative">
//         <input
//           type="date"
//           className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
//           value={newTransaction.date}
//           onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
//           onKeyDown={handleKeyDown}
//         />
//       </div>

//       {/* Time Input */}
//       <div className="relative">
//         <input
//           type="time"
//           className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
//           value={newTransaction.time}
//           onChange={(e) => setNewTransaction({ ...newTransaction, time: e.target.value })}
//           onKeyDown={handleKeyDown}
//         />
//       </div>

//       {/* Today Button */}
//       <button
//         type="button"
//         onClick={handleTodayClick}
//         className={`px-4 py-2 rounded ${darkMode ? "bg-gray-600 text-white" : "bg-blue-500 text-white"}`}
//       >
//         Today
//       </button>
//     </div>
//     <div className="flex items-center space-x-4">
//   <span>Transaction Type:</span>
//   <label className="flex items-center cursor-pointer">
//     <input
//       type="checkbox"
//       className="hidden"
//       checked={newTransaction.transactionType === "Ingoing"}
//       onChange={() =>
//         setNewTransaction((prev) => ({
//           ...prev,
//           transactionType: prev.transactionType === "Outgoing" ? "Ingoing" : "Outgoing",
//         }))
//       }
//     />
//     <div className={`w-16 h-8 flex items-center bg-gray-300 rounded-full p-1 transition ${newTransaction.transactionType === "Ingoing" ? "bg-blue-500" : "bg-gray-500"}`}>
//       <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${newTransaction.transactionType === "Ingoing" ? "translate-x-8" : ""}`}></div>
//     </div>
//     <span className="ml-2">{newTransaction.transactionType}</span>
//   </label>
// </div>
          
//           <div className="flex space-x-2">
//           <input type="text" className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} placeholder="Items (comma separated)" value={newTransaction.items} onChange={(e) => setNewTransaction({ ...newTransaction, items: e.target.value })} onKeyDown={handleKeyDown} />
//             {['Voucher', 'Payroll', 'Letter'].map((item) => (
//               <button key={item} className="bg-gray-500 text-white px-3 py-1 rounded" onClick={() => addShortcutItem(item)}>
//                 {item}
//               </button>
//             ))}
//           </div>
//           <input
//             type="text"
//             className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
//             placeholder="Control Number"
//             value={newTransaction.controlNumber}
//             onChange={(e) => setNewTransaction({ ...newTransaction, controlNumber: e.target.value })}
//             onKeyDown={handleKeyDown}
//           />
          
//            <div className="relative">
//             <input 
//               type="text" 
//               className={`border p-2 rounded w-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}` }
//               placeholder="From" 
//               value={newTransaction.from} 
//               onChange={(e) => setNewTransaction({ ...newTransaction, from: e.target.value })} 
//               list="from-options"
//             />
//             <datalist id="from-options">
//               {predefinedFromOptions.map((option) => (
//                 <option key={option} value={option} />
//               ))}
//             </datalist>
//           </div>

//           <div className="relative">
//             <input 
//               type="text" 
//               className={`border p-2 rounded w-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
//               placeholder="To" 
//               value={newTransaction.to} 
//               onChange={(e) => setNewTransaction({ ...newTransaction, to: e.target.value })} 
//               list="to-options"
//             />
//             <datalist id="to-options">
//               {predefinedToOptions.map((option) => (
//                 <option key={option} value={option} />
//               ))}
//             </datalist>
//           </div>
//         </div>
//         <div className="mt-4 flex space-x-2">
//           {(
//             <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center" onClick={addTransaction}>
//               <FiPlus className="mr-2" /> Add Transaction
//             </button>
//           )}
//         </div>
        
//       </div>

//         {/* Search and Sort Controls */}
//         <div className="flex justify-between mb-4">
//         <input type="text" placeholder="Search..." className={`border p-2 rounded w-1/2 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={search} onChange={(e) => setSearch(e.target.value)} />
//         <select className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} onChange={(e) => handleSort(e.target.value)}>
//           <option value="date">Sort by Date</option>
//           <option value="time">Sort by Time</option>
//           <option value="items">Sort by Items</option>
//           <option value="from">Sort by From</option>
//           <option value="to">Sort by To</option>
//         </select>
//       </div>
      

//       {/* Transactions List */}
//       <div className={`p-4 rounded-lg shadow-md transition-colors duration-300 overflow-y-auto ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
//         <h3 className="text-xl font-semibold mb-2">Transaction List</h3>
//         <table className="w-full border-collapse">
//           <thead>
//             <tr className={`transition-colors duration-300 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-300"}`}>
//               <th className="p-2 border">Date</th>
//               <th className="p-2 border">Time</th>
//               <th className="p-2 border">Items</th>
//               <th className="p-2 border">From</th>
//               <th className="p-2 border">To</th>
//               <th className="p-2 border">Control Number</th>
//               <th className="p-2 border">Type</th>
//               <th className="p-2 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTransactions.map((transaction) => (
//               <tr key={transaction.id} className="border-t" onDoubleClick={() => handleDoubleClick(transaction)}>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="date" value={editableTransaction.date} onChange={(e) => handleChange(e, "date")} className="border p-1 rounded" />
//                 ) : (
//                   transaction.date
//                 )}
//               </td>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="time" value={editableTransaction.time} onChange={(e) => handleChange(e, "time")} className="border p-1 rounded" />
//                 ) : (
//                   formatTimeTo12Hour(transaction.time)
//                 )}
//               </td>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="text" value={editableTransaction.items} onChange={(e) => handleChange(e, "items")} className="border p-1 rounded" />
//                 ) : (
//                   transaction.items.join(", ")
//                 )}
//               </td>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="text" value={editableTransaction.from} onChange={(e) => handleChange(e, "from")} className="border p-1 rounded" />
//                 ) : (
//                   transaction.from
//                 )}
//               </td>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="text" value={editableTransaction.to} onChange={(e) => handleChange(e, "to")} className="border p-1 rounded" />
//                 ) : (
//                   transaction.to
//                 )}
//               </td>
//               <td className="p-2 border text-center">
//                 {editId === transaction.id ? (
//                   <input type="text" value={editableTransaction.controlNumber} onChange={(e) => handleChange(e, "controlNumber")} className="border p-1 rounded" />
//                 ) : (
//                   transaction.controlNumber || "N/A"
//                 )}
//               </td>
//               <td className="p-2 border text-center">{transaction.transactionType}</td>
//               <td className="p-2 border text-center flex justify-center space-x-2">
//                 {editId === transaction.id ? (
//                   <>
//                     <button onClick={saveTransaction} className="bg-green-500 text-white px-3 py-1 rounded"><FiSave /></button>
//                     <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel Editing</button>
//                   </>
//                 ) : null}
//                 {/* Delete button shown only when not in edit mode */}
//                 {editId !== transaction.id && (
//                   <button onClick={() => deleteTransaction(transaction.id)} className="bg-red-500 text-white px-3 py-1 rounded"><FiTrash /></button>
//                 )}
//               </td>
//             </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default TransactionHistory;

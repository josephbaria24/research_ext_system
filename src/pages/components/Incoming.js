
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { FiTrash, FiPlus, FiEdit,FiSave  } from "react-icons/fi";


const TransactionHistory = ({ darkMode }) => {
  const [transactions, setTransactions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editableTransaction, setEditableTransaction] = useState({});
  const [startDate, setStartDate] = useState(new Date());
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    time: "",
    items: "",
    from: "",
    controlNumber: "",
    transactionType: "Outgoing",
    type: "",
    particulars: "" 
  });


  
  const [type, setType] = useState("");
  const [particulars, setParticulars] = useState("");

  const transactionsCollectionRef = collection(db, "incomingTransactions");

  const fetchTransactions = async () => {
  const transactionsRef = collection(db, "incomingTransactions"); // Change collection here
  const data = await getDocs(transactionsRef);
  const sortedTransactions = data.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }))
    .sort((a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time));
  setTransactions(sortedTransactions);
};

  
  

  useEffect(() => {
    fetchTransactions();
  }, []);



  const handleDoubleClick = (transaction) => {
    setEditId(transaction.id);
    setEditableTransaction(transaction); // Set current row data in state
  };

  const handleChange = (e, field) => {
    setEditableTransaction((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const saveTransaction = async () => {
    if (!editId) return;
  
    const transactionRef = doc(db, "incomingTransactions", editId);
    
    await updateDoc(transactionRef, {
      ...editableTransaction,
      items: typeof editableTransaction.items === "string" ? editableTransaction.items.split(",") : editableTransaction.items, 
    });
  
    setEditId(null);
    fetchTransactions();
  };

  const predefinedToOptions = [
    "ADMISSION",
    "BUDGET",
    "ADMIN",
    "OUP",
    "OVP",
    "ACCOUNTING",
    "RECORDS",
    "REGISTRAR",
    "DEL SUR CLUSTER",
    "DEL NORTE CLUSTER",
    "OCCIDENTAL CLUSTER",
    "ORIENTAL CLUSTER",
    "PCAT - CUYO"
  ];

  const [loading, setLoading] = useState(false); // Loading state

  const addTransaction = async () => {
    if (loading) return; // Prevent multiple submissions
    setLoading(true); // Set loading state to true
  
    const transactionData = {
      ...newTransaction,
      type: newTransaction.type || type, 
      particulars: newTransaction.particulars || particulars, 
    };
  
    if (!transactionData.date || !transactionData.time ||
        !transactionData.from || !transactionData.controlNumber) {
      toast.error("Please fill all fields!"); 
      setLoading(false); // Reset loading state
      return;
    }
  
    try {
      const data = await getDocs(transactionsCollectionRef);
      const existingControlNumbers = data.docs.map(doc => doc.data().controlNumber);
  
      if (existingControlNumbers.includes(transactionData.controlNumber)) {
        toast.error("Control number already exists! Please use a unique control number.");
        setLoading(false); // Reset loading state
        return;
      }
  
      await addDoc(transactionsCollectionRef, {
        ...transactionData,
        items: transactionData.items ? transactionData.items.split(",") : [], 
      });
  
      setNewTransaction({
        date: "", time: "", items: "", from: "", controlNumber: "", transactionType: "Outgoing", type: "", particulars: ""
      });
      setType(""); 
      setParticulars("");
  
      fetchTransactions();
      toast.success("Transaction added successfully!");
    } catch (error) {
      console.error("Firestore Error:", error);
      toast.error("Error adding transaction! Please try again.");
    } finally {
      setLoading(false); // Reset loading state after transaction completes
    }
  };

  // const addTransaction = async () => {
  //   const transactionData = {
  //     ...newTransaction,
  //     type: newTransaction.type || type,  
  //     particulars: newTransaction.particulars || particulars,  
  //   };
  
  //   if (!transactionData.date || !transactionData.time ||
  //       !transactionData.from || !transactionData.controlNumber) {
  //     toast.error("Please fill all fields!"); 
  //     return;
  //   }
  
  //   try {
  //     const transactionsRef = transactionData.transactionType === "Incoming" 
  //       ? collection(db, "incomingTransactions") // Save in the "incomingTransactions" collection
  //       : transactionsCollectionRef; // Default to "transactions" collection
  
  //     const data = await getDocs(transactionsRef);
  //     const existingControlNumbers = data.docs.map(doc => doc.data().controlNumber);
  
  //     if (existingControlNumbers.includes(transactionData.controlNumber)) {
  //       toast.error("Control number already exists! Please use a unique control number.");
  //       return;
  //     }
  
  //     await addDoc(transactionsRef, {
  //       ...transactionData,
  //       items: transactionData.items ? transactionData.items.split(",") : [], 
  //     });
  
  //     setNewTransaction({
  //       date: "", time: "", items: "", from: "", controlNumber: "", transactionType: "Incoming", type: "", particulars: ""
  //     });
  //     setType(""); 
  //     setParticulars("");
  
  //     fetchTransactions();
  //     toast.success("Transaction added successfully!");
  //   } catch (error) {
  //     console.error("Firestore Error:", error);
  //     toast.error("Error adding transaction! Please try again.");
  //   }
  // };
  
  
  

  const updateTransaction = async () => {
    if (!editId) return;

    const transactionRef = doc(db, "incomingTransactions", editId);
    await updateDoc(transactionRef, {
      date: newTransaction.date,
      time: newTransaction.time,
      items: newTransaction.items.split(","),
      from: newTransaction.from,
      controlNumber: newTransaction.controlNumber,
      transactionType: "Incoming",
    });

    setNewTransaction({ date: "", time: "", items: "", from: "" });
    setEditId(null);
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!isConfirmed) return;
  
    try {
      await deleteDoc(doc(db, "incomingTransactions", id));
      fetchTransactions();
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction.");
    }
  };
  

  const cancelEdit = () => {
    setNewTransaction({ date: "", time: "", items: "", from: "" });
    setEditId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or new line
      editId ? updateTransaction() : addTransaction();
    }
  };
  


  useEffect(() => {
    let filtered = transactions.filter((t) =>
      Object.values(t).some((val) => val.toString().toLowerCase().includes(search.toLowerCase()))
    );
    filtered = filtered.slice(0, 50);
    setFilteredTransactions(filtered);
  }, [search, transactions]);

  const handleSort = (key) => {
    const order = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortOrder(order);
  
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (key === "time") {
        const dateA = new Date(`1970-01-01T${a[key]}`);
        const dateB = new Date(`1970-01-01T${b[key]}`);
        return order === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        return order === "asc"
          ? a[key].toString().localeCompare(b[key].toString())
          : b[key].toString().localeCompare(a[key].toString());
      }
    });
  
    setFilteredTransactions(sorted);
  };


  const formatTimeTo12Hour = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12; // Convert 0-23 to 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  



  const handleTodayClick = () => {
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0]; // Extracts the date in 'yyyy-mm-dd' format
    const currentTime = today.toTimeString().split(" ")[0]; // Extracts the time in 'hh:mm:ss' format
    setNewTransaction({
      ...newTransaction,
      date: currentDate,
      time: currentTime.slice(0, 5), // Only take hours and minutes
    });
  };

  
  return (
    <div className={`w-full p-1 min-h-screen rounded transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-black"}`}>
      <h2 className="text-3xl font-bold mb-4 text-center">Incoming transactions</h2>
  
      {/* Add/Edit Transaction Form */}
      <div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
        <h3 className="text-xl font-semibold mb-2">{editId ? "Edit Transaction" : "Add Transaction"}</h3>
        <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-4">
      {/* Date Input */}
      <div className="relative">
        <input
          type="date"
          className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={newTransaction.date}
          onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Time Input */}
      <div className="relative">
        <input
          type="time"
          className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={newTransaction.time}
          onChange={(e) => setNewTransaction({ ...newTransaction, time: e.target.value })}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Today Button */}
      <button
        type="button"
        onClick={handleTodayClick}
        className={`px-4 py-2 rounded ${darkMode ? "bg-gray-600 text-white" : "bg-blue-500 text-white"}`}
      >
        Today
      </button>
    </div>

    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="voucher">Voucher</option>
          <option value="payroll">Payroll</option>
          <option value="letter">Letter</option>
        </select>
      </div>

      <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700">Control number</label>
      <input
            type="text"
            className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
            placeholder="Enter Control Number"
            value={newTransaction.controlNumber}
            onChange={(e) => setNewTransaction({ ...newTransaction, controlNumber: e.target.value })}
            onKeyDown={handleKeyDown}
          />
      </div>
      

      {type === "voucher" || type === "letter" || type === "payroll" ? (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Particulars</label>
          <textarea
            className="border p-2 rounded w-full resize-none overflow-hidden"
            placeholder="Enter Particulars"
            value={newTransaction.particulars}
            onChange={(e) => setNewTransaction({ ...newTransaction, particulars: e.target.value })}
            rows="1"
            onInput={(e) => {
                e.target.style.height = "auto"; // Reset height to recalculate
                e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
            }}
            />

        </div>
      ): null}
          
          
      
          <div className="relative">
          <label className="block text-sm font-medium text-gray-700">Incoming from</label>
            <input 
              type="text" 
              className={`border p-2 rounded w-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
              placeholder="From" 
              value={newTransaction.from} 
              onChange={(e) => setNewTransaction({ ...newTransaction, from: e.target.value })} 
              list="from-options"
            />
            <datalist id="from-options">
              {predefinedToOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
        <button 
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center" 
            onClick={addTransaction}
            disabled={loading} // Disable when loading
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 11-8 8z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <FiPlus className="mr-2" /> Add Transaction
              </>
            )}
          </button>
        </div>
        
      </div>

        {/* Search and Sort Controls */}
        <div className="flex justify-between mb-4">
        <input type="text" placeholder="Search..." className={`border p-2 rounded w-1/2 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} onChange={(e) => handleSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="time">Sort by Time</option>
          <option value="from">Sort by From</option>
        </select>
      </div>
      

      {/* Transactions List */}
      <div className={`p-4 rounded-lg shadow-md transition-colors duration-300 overflow-y-auto ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
        <h3 className="text-xl font-semibold mb-2">Transaction List</h3>
        
        <table className="w-full border-collapse">
          <thead>
            <tr className={`transition-colors duration-300 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-300"}`}>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">From</th>
              <th className="p-2 border">Control Number</th>
              <th className="p-2 border">Type</th>
              {transactions.some(t => t.type === "letter" || t.type === "payroll" || t.type === "voucher") && (
                <th className="p-2 border">Particulars</th>
              )}
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <div className="max-h-96 overflow-y-auto border rounded"></div>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-t" onDoubleClick={() => handleDoubleClick(transaction)}>
              <td className="p-2 border text-center">
                {editId === transaction.id ? (
                  <input type="date" value={editableTransaction.date} onChange={(e) => handleChange(e, "date")} className="border p-1 rounded" />
                ) : (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{ transaction.date}</span>
                )}
              </td>
              <td className="p-2 border text-center">
                {editId === transaction.id ? (
                  <input type="time" value={editableTransaction.time} onChange={(e) => handleChange(e, "time")} className="border p-1 rounded" />
                ) : (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{formatTimeTo12Hour(transaction.time)}</span>
                )}
              </td>

              <td className="p-2 border text-center">
                {editId === transaction.id ? (
                  <input type="text" value={editableTransaction.from} onChange={(e) => handleChange(e, "from")} className="border p-1 rounded" />
                ) : (
                  transaction.from
                )}
              </td>
              <td className="p-2 border text-center">
                {editId === transaction.id ? (
                  <input type="text" value={editableTransaction.controlNumber} onChange={(e) => handleChange(e, "controlNumber")} className="border p-1 rounded" />
                ) : (
                  transaction.controlNumber || "N/A"
                )}
              </td>
              <td className="p-2 border text-center" onDoubleClick={() => handleDoubleClick(transaction)}>
                  {editId === transaction.id ? (
                    <select
                      value={editableTransaction.type}
                      onChange={(e) => handleChange(e, "type")}
                      className="border p-2 rounded"
                    >
                      <option value="voucher">Voucher</option>
                      <option value="payroll">Payroll</option>
                      <option value="letter">Letter</option>
                    </select>
                  ) : (
                    transaction.type
                  )}
                </td>

              <td className="p-2 border text-center" onDoubleClick={() => handleDoubleClick(transaction)}>
              {editId === transaction.id ? (
                <input
                  type="text"
                  value={editableTransaction.particulars}
                  onChange={(e) => handleChange(e, "particulars")}
                  className="border p-2 rounded"
                />
              ) : (
                transaction.particulars
              )}
            </td>
            
              <td className="p-2 border text-center flex justify-center space-x-2">
                {editId === transaction.id ? (
                  <>
                    <button onClick={saveTransaction} className="bg-green-500 text-white px-3 py-1 rounded"><FiSave /></button>
                    <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel Editing</button>
                  </>
                ) : null}
                {/* Delete button shown only when not in edit mode */}
                {editId !== transaction.id && (
                  <button onClick={() => deleteTransaction(transaction.id)} className="bg-red-500 text-white px-3 py-1 rounded"><FiTrash /></button>
                )}
              </td>
            </tr>
            ))}
          </tbody>
        </table>
        </div>

      <ToastContainer />
    </div>
  );
};

export default TransactionHistory;

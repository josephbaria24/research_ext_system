
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch } from "react-icons/fa";
import { ToastContainer } from 'react-toastify';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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
    to: "",
    controlNumber: "",
    transactionType: "Outgoing",
    type: "",  // <-- Added type
    particulars: "" // <-- Added particulars
  });


  


  const [type, setType] = useState("");
  const [particulars, setParticulars] = useState("");

  const transactionsCollectionRef = collection(db, "transactions");

  const fetchTransactions = async () => {
    const data = await getDocs(transactionsCollectionRef);
    // Sort transactions by date in descending order (newest first)
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
  
    const transactionRef = doc(db, "transactions", editId);
    
    await updateDoc(transactionRef, {
      ...editableTransaction,
      items: typeof editableTransaction.items === "string" ? editableTransaction.items.split(",") : editableTransaction.items, 
    });
  
    setEditId(null);
    fetchTransactions();
  };

  const predefinedToOptions = [
    "VPEC",
    "BUDGET",
    "ADMIN",
    "OUP",
    "OVP",
    "ACCOUNTING",
    "RECORDS",
    "REGISTRAR"
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
        !transactionData.to || !transactionData.controlNumber) {
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
        date: "", time: "", items: "", to: "", controlNumber: "", transactionType: "Outgoing", type: "", particulars: ""
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

  

  const updateTransaction = async () => {
    if (!editId) return;

    const transactionRef = doc(db, "transactions", editId);
    await updateDoc(transactionRef, {
      date: newTransaction.date,
      time: newTransaction.time,
      items: newTransaction.items.split(","),
      to: newTransaction.to,
      controlNumber: newTransaction.controlNumber,
      transactionType: "Outgoing",
    });

    setNewTransaction({ date: "", time: "", items: "", to: "" });
    setEditId(null);
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!isConfirmed) return;
  
    try {
      await deleteDoc(doc(db, "transactions", id));
      fetchTransactions();
      toast.success("Transaction deleted successfully!");
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction.");
    }
  };
  

  const cancelEdit = () => {
    setNewTransaction({ date: "", time: "", items: "", to: "" });
    setEditId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission or new line
      editId ? updateTransaction() : addTransaction();
    }
  };
  

  const addShortcutItem = (item) => {
    setNewTransaction((prev) => ({
      ...prev,
      items: prev.items ? `${prev.items}, ${item}` : item,
    }));
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
    //<div className="w-full p-1 min-h-screen rounded transition-colors duration-300 bg-transparent">

    <div className={`w-full p-1 min-h-screen rounded transition-colors duration-300 bg-transparent ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-black"}`}>
      <div className="border-2 border-primary rounded-lg p-2 mb-2">
      <h2 className="text-2xl font-bold text-center">OUTGOING TRANSACTIONS</h2>
    </div>

  
{/* Add/Edit Transaction Form */}
<div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
  <h3 className="text-xl font-semibold mb-2">{editId ? "Edit Transaction" : "Add Transaction"}</h3>

  {/* Main Container for Inputs */}
  <div className="flex space-x-4"> {/* Reduced space-x-6 to space-x-4 */}
  {/* Left Side: Date, Time, Control Number, Type, Incoming From */}
  <div className="flex-1 max-w-[800px]">
    {/* Date, Time, and Today Button */}
    <div className="flex items-center space-x-4 mb-4">
      <input
        type="date"
        className={`border p-2 rounded transition-colors duration-300 outline-none w-[250px] w-1/3
          ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                    : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
        value={newTransaction.date}
        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
        onKeyDown={handleKeyDown}
      />
      <input
        type="time"
        className={`border p-2 rounded transition-colors duration-300 outline-none w-[250px] w-1/3
          ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                    : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
        value={newTransaction.time}
        onChange={(e) => setNewTransaction({ ...newTransaction, time: e.target.value })}
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={handleTodayClick}
        className={`px-4 py-2 rounded max-w-[130px] w-full text-center 
          ${darkMode ? "bg-primary text-white" : "bg-primary text-white"}`}
      >
        Today
      </button>
    </div>

    {/* Type and Control Number in the Same Row */}
    <div className="flex space-x-4 mb-4">
      <div className="max-w-[500px]">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Control Number</label>
        <input
          type="text"
          className={`border p-2 rounded transition-colors duration-300 outline-none max-w-[350px] 
            ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                      : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
          placeholder="Enter Control Number"
          value={newTransaction.controlNumber}
          onChange={(e) => setNewTransaction({ ...newTransaction, controlNumber: e.target.value })}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className="max-w-[400px]">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Type</label>
        <select
          className={`mt-0 block w-[145px] border rounded-md shadow-sm p-2 transition-colors max-w-[400px] duration-300 outline-none
            ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400"
                      : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Select Type</option>
          <option value="voucher">Voucher</option>
          <option value="payroll">Payroll</option>
          <option value="letter">Letter</option>
        </select>
      </div>
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Outgoing to</label>
        <input 
          type="text" 
          className={`border p-2 rounded w-[243px] transition-colors duration-300 outline-none
            ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                      : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
          placeholder="To" 
          value={newTransaction.to} 
          onChange={(e) => setNewTransaction({ ...newTransaction, to: e.target.value })} 
          list="to-options"
        />
        <datalist id="to-options">
          {predefinedToOptions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>
    </div>
  </div>

  {/* Divider */}
  <div className="w-px bg-gray-300 h-[122px] mx-2"></div> {/* Reduced mx-3 to mx-2 */}

  {/* Right Side: Particulars */}
  <div className="w-full"> {/* Reduced width from w-[200px] to w-[180px] */}
    <label className={`block text-lg font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Particulars</label>
    <textarea
      className={`border p-2 rounded w-full h-[94px] resize-none transition-colors duration-300 outline-none
        ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                  : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
      placeholder="Enter Particulars"
      value={newTransaction.particulars}
      onChange={(e) => setNewTransaction({ ...newTransaction, particulars: e.target.value })}
    />
  </div>
</div>

  {/* Add Transaction Button */}
  <div className="flex justify-end mt-0">
    <button 
      className="bg-accent text-white px-4 py-2 rounded flex items-center"
      onClick={addTransaction}
      disabled={loading}
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
          <div className="relative w-1/4">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className={`border p-2 pl-10 rounded w-full transition-colors duration-300 outline-primary
                ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                          : "bg-white text-black border-primary focus:border-orange-500"}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        <select className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} onChange={(e) => handleSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="time">Sort by Time</option>
          <option value="to">Sort by To</option>
        </select>
      </div>
      

      {/* Transactions List */}
<div className={`p-4 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-300" : "bg-white"}`}>
  <h3 className="text-xl font-semibold mb-2">Transaction List</h3>

  <div className="border rounded">
    {/* Table Header (Fixed) */}
    <table className="w-full border-collapse table-fixed"> {/* Added table-fixed */}
      <thead>
        <tr className={`transition-colors duration-300 ${darkMode ? "bg-gray-700 text-white" : "bg-accent text-white"}`}>
          <th className="p-2 border w-[8%]">Date</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Time</th> {/* Added explicit width */}
          <th className="p-2 border w-[9%]">To</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Control Number</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Type</th> {/* Added explicit width */}

            <th className="p-2 border w-[18%]">Particulars</th> 

          <th className="p-2 border w-[5%]">Action</th> {/* Added explicit width */}
        </tr>
      </thead>
    </table>

    {/* Scrollable Table Body */}
    <div className="max-h-[400px] overflow-y-auto">
      <table className="w-full border-collapse table-fixed"> {/* Added table-fixed */}
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id} className="border-t" onDoubleClick={() => handleDoubleClick(transaction)}>
              {/* Date Column */}
              <td className="p-2 border text-center w-[8%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <input type="date" value={editableTransaction.date} onChange={(e) => handleChange(e, "date")} className="border p-1 rounded w-full" />
                ) : (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{transaction.date}</span>
                )}
              </td>

              {/* Time Column */}
              <td className="p-2 border text-center w-[6%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <input type="time" value={editableTransaction.time} onChange={(e) => handleChange(e, "time")} className="border p-1 rounded w-full" />
                ) : (
                  <span className="whitespace-nowrap overflow-hidden text-ellipsis">{formatTimeTo12Hour(transaction.time)}</span>
                )}
              </td>

              {/* To Column */}
              <td className="p-2 border text-center w-[9%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <input type="text" value={editableTransaction.to} onChange={(e) => handleChange(e, "to")} className="border p-1 rounded w-full" />
                ) : (
                  transaction.to
                )}
              </td>

              {/* Control Number Column */}
              <td className="p-2 border text-center w-[6%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <input type="text" value={editableTransaction.controlNumber} onChange={(e) => handleChange(e, "controlNumber")} className="border p-1 rounded w-full" />
                ) : (
                  transaction.controlNumber || "N/A"
                )}
              </td>

              {/* Type Column */}
              <td className="p-2 border text-center w-[6%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <select value={editableTransaction.type} onChange={(e) => handleChange(e, "type")} className="border p-2 rounded w-full">
                    <option value="voucher">Voucher</option>
                    <option value="payroll">Payroll</option>
                    <option value="letter">Letter</option>
                  </select>
                ) : (
                  transaction.type
                )}
              </td>

              <td className="p-2 border text-center w-[18%]">
  {editId === transaction.id ? (
    <input
      type="text"
      value={editableTransaction.particulars}
      onChange={(e) => handleChange(e, "particulars")}
      className="border p-1 rounded w-full"
    />
  ) : (
    transaction.particulars
  )}
</td>

              {/* Action Buttons */}
              <td className="p-2 border text-center w-[5%]"> {/* Added explicit width */}
                <div className="flex justify-center space-x-2">
                  {editId === transaction.id ? (
                    <>
                      <button onClick={saveTransaction} className="bg-green-500 text-white px-3 py-1 rounded"><FiSave /></button>
                      <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel Editing</button>
                    </>
                  ) : null}
                  {editId !== transaction.id && (
                    <button onClick={() => deleteTransaction(transaction.id)} className="bg-red-500 text-white px-3 py-1 rounded"><FiTrash /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

      <ToastContainer />
    </div>
  );
};

export default TransactionHistory;

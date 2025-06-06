
import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch } from "react-icons/fa";
import { ToastContainer } from 'react-toastify';
import { useForm } from 'react-hook-form';

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
    particulars: "",
    amount: "" 
  });


  
  const [type, setType] = useState("");
  const [particulars, setParticulars] = useState("");

  const [selectedType, setSelectedType] = useState("Job Order");
  const [totalAmount, setTotalAmount] = useState(0);

  const transactionsCollectionRef = collection(db, "incomingTransactions");

  const fetchTransactions = async () => {
  const transactionsRef = collection(db, "incomingTransactions"); // Change collection here
  const data = await getDocs(transactionsRef);
  const sortedTransactions = data.docs
    .map((doc) => ({ ...doc.data(), id: doc.id }))
    .sort((a, b) => new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time));
  setTransactions(sortedTransactions);
};

 // ✅ Place it here, inside the component
 const { register, watch, handleSubmit, formState } = useForm();

 const calculateSelect = watch('type');
 const showAmountFields = calculateSelect === 'Job Request' || calculateSelect === 'Purchase Request';

  useEffect(() => {
    fetchTransactions();
  }, []);



  const calculateTotalAmount = () => {
    const filtered = filteredTransactions.filter(
      (t) => t.type && t.type.toLowerCase() === selectedType.toLowerCase()
    );
  
    const total = filtered.reduce((acc, curr) => {
      const rawAmount = curr.amount?.toString().replace(/,/g, "") || "0";
      return acc + parseFloat(rawAmount);
    }, 0);
  
    setTotalAmount(total);
  };
  



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
        date: "", time: "", items: "", from: "", controlNumber: "", transactionType: "Outgoing", type: "", particulars: "", amount: ""
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

    const transactionRef = doc(db, "incomingTransactions", editId);
    await updateDoc(transactionRef, {
      date: newTransaction.date,
      time: newTransaction.time,
      items: newTransaction.items.split(","),
      from: newTransaction.from,
      controlNumber: newTransaction.controlNumber,
      transactionType: "Incoming",
      amount: "",
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
    <div className="w-full p-1 min-h-screen rounded transition-colors duration-300 bg-transparent">

<div className="border-2 border-primary rounded-lg p-2 mb-2">
      <h2 className="text-2xl font-bold text-center">INCOMING TRANSACTIONS</h2>
    </div>
    
    <div className="flex items-center space-x-4 mb-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className={`border p-2 rounded transition-colors duration-300 outline-none 
            ${darkMode ? "bg-gray-700 text-white border-gray-500" 
                      : "bg-white text-black border-gray-300"}`}
        >
          
  <option value="job request">Job Request</option>
  <option value="purchase request">Purchase Request</option>
        </select>

        <button
          onClick={calculateTotalAmount}
          className={`px-4 py-2 rounded ${darkMode ? "bg-blue-500 text-white" : "bg-orange-500 text-white"}`}
        >
          Calculate Total Amount
        </button>

        <span className="font-semibold">
          Total: ₱ {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
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
      <div className="max-w-[300px]">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Control Number</label>
        <input
          type="text"
          className={`border p-2 rounded transition-colors duration-300 outline-none max-w-[150px] 
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
          <option value="job request">Job request</option>
          <option value="purchase request">Purchase request</option>
        </select>
      </div>
      <div className="max-w-[500px]">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Amount</label>
        <input
            type="text"
            className={`border p-2 rounded transition-colors duration-300 outline-none max-w-[130px] 
              ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                        : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
            placeholder="Enter amount"
            value={newTransaction.amount}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/,/g, ''); // remove commas first
              const numericValue = rawValue.replace(/\D/g, ''); // remove non-digit chars

              // Format with commas
              const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

              setNewTransaction({ ...newTransaction, amount: formatted });
            }}
            onKeyDown={handleKeyDown}
          />


      </div>
      <div className="w-full">
        <label className={`block text-sm font-medium text-gray-700 ${darkMode ? " text-white" : " text-black"}`}>Incoming From</label>
        <input 
          type="text" 
          className={`border p-2 rounded w-[200px] transition-colors duration-300 outline-none
            ${darkMode ? "bg-gray-700 text-white border-gray-500 focus:border-blue-400" 
                      : "bg-white text-black border-gray-300 focus:border-orange-500"}`}
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
          <option value="to">Sort by From</option>
        </select>
      </div>
      

      

    {/* Transactions List */}
<div className={`p-4 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
  <h3 className="text-xl font-semibold mb-2">Transaction List</h3>

  <div className="border rounded">
    {/* Table Header (Fixed) */}
    <table className="w-full border-collapse table-fixed"> {/* Added table-fixed */}
      <thead>
        <tr className={`transition-colors duration-300 ${darkMode ? "bg-gray-700 text-white" : "bg-accent text-white"}`}>
          <th className="p-2 border w-[5%]">Date</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Time</th> {/* Added explicit width */}
          <th className="p-2 border w-[9%]">From</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Control Number</th> {/* Added explicit width */}
          <th className="p-2 border w-[6%]">Type</th> {/* Added explicit width */}
          
            <th className="p-2 border w-[18%]">Particulars</th>
            <th className="p-2 border w-[8%]">Amount</th>
      
          <th className="p-2 border w-[5%]">Action</th> {/* Added explicit width */}
        </tr>
      </thead>
    </table>

    {/* Scrollable Table Body */}
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full border-collapse table-fixed"> {/* Added table-fixed */}
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id} className="border-t hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300" onDoubleClick={() => handleDoubleClick(transaction)}>
              
              {/* Date Column */}
              <td className="p-2 border text-center w-[5%]"> {/* Added explicit width */}
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

              {/* From Column */}
              <td className="p-2 border text-center w-[9%]"> {/* Added explicit width */}
                {editId === transaction.id ? (
                  <input type="text" value={editableTransaction.from} onChange={(e) => handleChange(e, "from")} className="border p-1 rounded w-full" />
                ) : (
                  transaction.from
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
                  <select
                    value={editableTransaction.type}
                    onChange={(e) => handleChange(e, "type")}
                    className="border p-2 rounded w-full"
                  >
                    <option value="voucher">Voucher</option>
                    <option value="payroll">Payroll</option>
                    <option value="letter">Letter</option>
                    <option value="job request">Job request</option>
                    <option value="purchase request">Purchase request</option>
                  </select>
                ) : (
                  transaction.type
                )}
              </td>

              {/* Particulars Column (Only if needed) */}
              
                <td className="p-2 border text-center w-[18%]"> {/* Added explicit width */}
                  {editId === transaction.id ? (
                    <input
                      type="text"
                      value={editableTransaction.particulars}
                      onChange={(e) => handleChange(e, "particulars")}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    transaction.particulars || "N/A"
                  )}
                </td>

                <td className="p-2 border text-center w-[8%]"> {/* Added explicit width */}
                  {editId === transaction.id ? (
                    <input
                      type="text"
                      value={editableTransaction.amount}
                      onChange={(e) => handleChange(e, "amount")}
                      className="border p-1 rounded w-full"
                    />
                  ) : (
                    transaction.amount
                    ? Number(transaction.amount.toString().replace(/,/g, "")).toLocaleString()
                    : "N/A"
                  
                  )}
                </td>

              {/* Action Buttons */}
              <td className="p-2 border text-center w-[5%]"> {/* Added explicit width */}
                <div className="flex justify-center space-x-2">
                  {editId === transaction.id ? (
                    <>
                      <button onClick={saveTransaction} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"><FiSave /></button>
                      <button onClick={cancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => deleteTransaction(transaction.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"><FiTrash /></button>
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

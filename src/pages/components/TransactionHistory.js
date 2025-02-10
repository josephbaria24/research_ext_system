import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FiTrash, FiPlus, FiEdit } from "react-icons/fi";

const TransactionHistory = ({ darkMode }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    time: "",
    items: "",
    from: "",
    to: "",
  });
  const [editId, setEditId] = useState(null); // Track editing transaction ID

  const transactionsCollectionRef = collection(db, "transactions");

  const fetchTransactions = async () => {
    const data = await getDocs(transactionsCollectionRef);
    setTransactions(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);


  const predefinedFromOptions = [
    "VPEC",
    "BUDGET",
    "ADMIN",
    "PRES. OFFICE",
    "V.P OFFICE",
    "ACCOUNTING",
  ];

  const predefinedToOptions = [
    "VPEC",
    "BUDGET",
    "ADMIN",
    "PRES. OFFICE",
    "V.P OFFICE",
    "ACCOUNTING",
  ];


  const addTransaction = async () => {
    if (!newTransaction.date || !newTransaction.time || !newTransaction.items || !newTransaction.from || !newTransaction.to) {
      alert("Please fill all fields!");
      return;
    }

    await addDoc(transactionsCollectionRef, {
      date: newTransaction.date,
      time: newTransaction.time,
      items: newTransaction.items.split(","),
      from: newTransaction.from,
      to: newTransaction.to,
    });

    setNewTransaction({ date: "", time: "", items: "", from: "", to: "" });
    fetchTransactions();
  };

  const updateTransaction = async () => {
    if (!editId) return;

    const transactionRef = doc(db, "transactions", editId);
    await updateDoc(transactionRef, {
      date: newTransaction.date,
      time: newTransaction.time,
      items: newTransaction.items.split(","),
      from: newTransaction.from,
      to: newTransaction.to,
    });

    setNewTransaction({ date: "", time: "", items: "", from: "", to: "" });
    setEditId(null);
    fetchTransactions();
  };

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, "transactions", id));
    fetchTransactions();
  };

  const startEdit = (transaction) => {
    setNewTransaction({
      date: transaction.date,
      time: transaction.time,
      items: transaction.items.join(", "),
      from: transaction.from,
      to: transaction.to,
    });
    setEditId(transaction.id);
  };

  const cancelEdit = () => {
    setNewTransaction({ date: "", time: "", items: "", from: "", to: "" });
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
      return order === "asc"
        ? a[key].toString().localeCompare(b[key].toString())
        : b[key].toString().localeCompare(a[key].toString());
    });
    setFilteredTransactions(sorted);
  };

  return (
    <div className={`w-full p-6 min-h-screen rounded transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-black"}`}>
      <h2 className="text-3xl font-bold mb-4 text-center">Transaction History</h2>
  
      {/* Add/Edit Transaction Form */}
      <div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
        <h3 className="text-xl font-semibold mb-2">{editId ? "Edit Transaction" : "Add Transaction"}</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} onKeyDown={handleKeyDown} />
          <input type="time" className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={newTransaction.time} onChange={(e) => setNewTransaction({ ...newTransaction, time: e.target.value })} onKeyDown={handleKeyDown} />
          <input type="text" className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} placeholder="Items (comma separated)" value={newTransaction.items} onChange={(e) => setNewTransaction({ ...newTransaction, items: e.target.value })} onKeyDown={handleKeyDown} />
          <div className="flex space-x-2">
            {['Voucher', 'Payroll', 'Letter'].map((item) => (
              <button key={item} className="bg-gray-500 text-white px-3 py-1 rounded" onClick={() => addShortcutItem(item)}>
                {item}
              </button>
            ))}
          </div>
          
           <div className="relative">
            <input 
              type="text" 
              className={`border p-2 rounded w-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}` }
              placeholder="From" 
              value={newTransaction.from} 
              onChange={(e) => setNewTransaction({ ...newTransaction, from: e.target.value })} 
              list="from-options"
            />
            <datalist id="from-options">
              {predefinedFromOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>

          <div className="relative">
            <input 
              type="text" 
              className={`border p-2 rounded w-full ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
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
        <div className="mt-4 flex space-x-2">
          {editId ? (
            <>
              <button className="bg-green-500 text-white px-4 py-2 rounded flex items-center" onClick={updateTransaction}>
                <FiPlus className="mr-2" /> Update Transaction
              </button>
              <button className="bg-gray-500 text-white px-4 py-2 rounded flex items-center" onClick={cancelEdit}>
                Cancel Edit
              </button>
            </>
          ) : (
            <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center" onClick={addTransaction}>
              <FiPlus className="mr-2" /> Add Transaction
            </button>
          )}
        </div>
      </div>

        {/* Search and Sort Controls */}
        <div className="flex justify-between mb-4">
        <input type="text" placeholder="Search..." className={`border p-2 rounded w-1/2 ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`border p-2 rounded ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`} onChange={(e) => handleSort(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="time">Sort by Time</option>
          <option value="items">Sort by Items</option>
          <option value="from">Sort by From</option>
          <option value="to">Sort by To</option>
        </select>
      </div>
      

      {/* Transactions List */}
      <div className={`p-4 rounded-lg shadow-md transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
        <h3 className="text-xl font-semibold mb-2">Transaction List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className={`transition-colors duration-300 ${darkMode ? "bg-gray-700 text-white" : "bg-gray-300"}`}>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Items</th>
              <th className="p-2 border">From</th>
              <th className="p-2 border">To</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="p-2 border text-center">{transaction.date}</td>
                <td className="p-2 border text-center">{transaction.time}</td>
                <td className="p-2 border text-center">{transaction.items.join(", ")}</td>
                <td className="p-2 border text-center">{transaction.from}</td>
                <td className="p-2 border text-center">{transaction.to}</td>
                <td className="p-2 border text-center flex justify-center space-x-2">
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded"><FiEdit /></button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded"><FiTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;

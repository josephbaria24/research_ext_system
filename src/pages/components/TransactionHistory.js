import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { FiTrash, FiPlus } from "react-icons/fi";

const TransactionHistory = ({ darkMode }) => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: "",
    time: "",
    items: "",
    from: "",
    to: "",
  });

  const transactionsCollectionRef = collection(db, "transactions");

  // Move fetchTransactions outside of useEffect
  const fetchTransactions = async () => {
    const data = await getDocs(transactionsCollectionRef);
    setTransactions(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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
    fetchTransactions(); // Now this will work
  };

  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, "transactions", id));
    fetchTransactions(); // Now this will work
  };

  return (
    <div className={`w-full p-6 min-h-screen rounded transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-black"}`}>
      <h2 className="text-3xl font-bold mb-4 text-center">Transaction History</h2>

      {/* Add Transaction Form */}
      <div className={`p-4 rounded-lg shadow-md mb-6 transition-colors duration-300 ${darkMode ? "bg-gray-800 text-gray-300" : "bg-white"}`}>
        <h3 className="text-xl font-semibold mb-2">Add Transaction</h3>
        <div className="grid grid-cols-2 gap-4">
          <input type="date" className="border p-2 rounded" value={newTransaction.date} onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })} />
          <input type="time" className="border p-2 rounded" value={newTransaction.time} onChange={(e) => setNewTransaction({ ...newTransaction, time: e.target.value })} />
          <input type="text" className="border p-2 rounded" placeholder="Items (comma separated)" value={newTransaction.items} onChange={(e) => setNewTransaction({ ...newTransaction, items: e.target.value })} />
          <input type="text" className="border p-2 rounded" placeholder="From" value={newTransaction.from} onChange={(e) => setNewTransaction({ ...newTransaction, from: e.target.value })} />
          <input type="text" className="border p-2 rounded" placeholder="To" value={newTransaction.to} onChange={(e) => setNewTransaction({ ...newTransaction, to: e.target.value })} />
        </div>
        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded flex items-center" onClick={addTransaction}>
          <FiPlus className="mr-2" /> Add Transaction
        </button>
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
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-t">
                <td className="p-2 border text-center">{transaction.date}</td>
                <td className="p-2 border text-center">{transaction.time}</td>
                <td className="p-2 border text-center">{transaction.items.join(", ")}</td>
                <td className="p-2 border text-center">{transaction.from}</td>
                <td className="p-2 border text-center">{transaction.to}</td>
                <td className="p-2 border text-center flex justify-center">
                  <button className="bg-red-500 text-white px-3 py-1 rounded ml-2" onClick={() => deleteTransaction(transaction.id)}>
                    <FiTrash />
                  </button>
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

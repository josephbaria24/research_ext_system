import React, { useState, useEffect } from "react";
import { FiMenu, FiX, FiFileText, FiClock, FiUser, FiChevronLeft, FiSun, FiMoon, FiPhoneOutgoing, FiArrowDownLeft, FiArrowUpLeft, FiArrowDownRight } from "react-icons/fi";
import TransactionHistory from "./components/Outgoing";
import Incoming from "./components/Incoming";
import { auth } from "../firebase";

const HomePage = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPage, setSelectedPage] = useState("transactions");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setAccountName(user.displayName || user.email);
      } else {
        setAccountName("Guest");
      }
    });
    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (selectedPage) {
      case "transactions":
        return <TransactionHistory darkMode={darkMode} />;
      case "documents":
        return <Incoming darkMode={darkMode} />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div
  className={`flex min-h-screen transition-colors duration-300 
    ${
      darkMode
        ? "bg-gray-900 text-gray-200"
        : "bg-gradient-to-br from-orange-200 via-white to-peach-100 text-black"
    }`}
>

  
      {/* Sidebar */}
      <div
        className={`h-screen flex flex-col justify-between bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
          isExpanded ? "w-64 p-4" : "w-16 p-2"
        }`}
      >
        <div>
          <div className="flex justify-between items-center p-3 pb-6"> 
            {isExpanded && <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">Menu</h2>}
            <button onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <FiChevronLeft className="text-3xl text-gray-700 dark:text-gray-200" /> : <FiMenu className="text-2xl text-gray-700 dark:text-gray-200" />}
            </button>
          </div>
          <nav className="space-y-3">
            <button
              className={`flex items-center space-x-2 p-4 w-full rounded-lg shadow transition duration-300 ${
                selectedPage === "transactions" ? "bg-customOrange text-white" : "bg-orange-100 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setSelectedPage("transactions")}
            >
              <FiArrowUpLeft className="text-xl" />
              {isExpanded && <span className="text-m font-medium">Outgoing</span>}
            </button>
            <button
              className={`flex items-center space-x-2 p-4 w-full rounded-lg shadow transition duration-300 ${
                selectedPage === "documents" ? "bg-customOrange text-white" : "bg-orange-100 dark:bg-gray-700 dark:text-gray-300"
              }`}
              onClick={() => setSelectedPage("documents")}
            >
              <FiArrowDownRight className="text-xl" />
              {isExpanded && <span className="text-m font-medium">Incoming</span>}
            </button>
          </nav>
        </div>
        <div className="flex flex-col space-y-3">
        <div className="flex items-center justify-between p-4 border-2 border-primary rounded-lg">
          {isExpanded && <span className="text-sm font-medium dark:text-gray-300">{accountName}</span>}
          <FiUser className="text-xl dark:text-gray-300" />
        </div>

          <button className="flex items-center justify-between p-4 bg-primary dark:bg-gray-700 rounded-lg" onClick={() => setDarkMode(!darkMode)}>
            {isExpanded && <span className="text-m font-medium text-white dark:text-gray-300">Theme</span>}
            {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-white dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-8 overflow-auto h-screen">{renderContent()}</div>
    </div>
  );
};

const Welcome = () => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md text-center">
    <h1 className="text-4xl font-extrabold text-black dark:text-white mb-6">WELCOME</h1>
    <p className="text-lg text-gray-700 dark:text-gray-300">Choose an option from the menu.</p>
  </div>
);

const Documents = () => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Documents</h2>
    <p className="text-gray-600 dark:text-gray-300">Your saved documents will appear here...</p>
  </div>
);

export default HomePage;

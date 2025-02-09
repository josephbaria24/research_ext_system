import React, { useState } from "react";
import { FiMenu, FiX, FiFileText, FiClock, FiUser,FiChevronLeft  } from "react-icons/fi"; // Icons
import TransactionHistory from "./components/TransactionHistory"; // ✅ Import the component

const HomePage = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Sidebar expand state
  const [selectedPage, setSelectedPage] = useState("transactions"); // Track selected page

  // Dynamic content rendering
  const renderContent = () => {
    switch (selectedPage) {
      case "transactions":
        return <TransactionHistory />;
      case "documents":
        return <Documents />;
      default:
        return <Welcome />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-white via-white to-peach-300">
      {/* 🔹 Sidebar */}
      <div
        className={`h-screen flex flex-col justify-between bg-white shadow-lg transition-all duration-300 ${
          isExpanded ? "w-64 p-4" : "w-16 p-2"
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex justify-between items-center p-3">
  {isExpanded && <h2 className="text-xl font-medium text-gray-700">Menu</h2>}
  <button onClick={() => setIsExpanded(!isExpanded)}>
    {isExpanded ? (
      <FiChevronLeft className="text-3xl text-gray-700" /> // Left arrow when expanded
    ) : (
      <FiMenu className="text-2xl text-gray-700" /> // Menu icon when collapsed
    )}
  </button>
</div>

          {/* Sidebar Navigation */}
          <nav className="space-y-4">
            <button
              className={`flex items-center space-x-2 p-4 w-full rounded-lg shadow transition duration-300 ${
                selectedPage === "transactions" ? "bg-orange-500 text-white" : "bg-orange-200"
              }`}
              onClick={() => setSelectedPage("transactions")}
            >
              <FiClock className="text-xl" />
              {isExpanded && <span className="text-lg font-semibold">Transaction History</span>}
            </button>
            <button
              className={`flex items-center space-x-2 p-4 w-full rounded-lg shadow transition duration-300 ${
                selectedPage === "documents" ? "bg-orange-500 text-white" : "bg-orange-200"
              }`}
              onClick={() => setSelectedPage("documents")}
            >
              <FiFileText className="text-xl" />
              {isExpanded && <span className="text-lg font-semibold">Documents</span>}
            </button>
          </nav>
        </div>

        {/* Profile Section */}
        <div className="flex items-center space-x-2 p-4 bg-gray-200 rounded-lg">
          <FiUser className="text-xl" />
          {isExpanded && <span className="text-lg font-semibold">John Doe</span>}
        </div>
      </div>

      {/* 🔹 Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">{renderContent()}</div>
    </div>
  );
};

// Content Components
const Welcome = () => (
  <div className="bg-white/20 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md text-center">
    <h1 className="text-4xl font-extrabold text-black mb-6">WELCOME</h1>
    <p className="text-lg text-gray-700">Choose an option from the menu.</p>
  </div>
);

const Documents = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
    <h2 className="text-2xl font-bold mb-4">Documents</h2>
    <p className="text-gray-600">Your saved documents will appear here...</p>
  </div>
);

export default HomePage;

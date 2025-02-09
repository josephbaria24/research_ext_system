import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { auth, provider, signInWithPopup, db, collection, query, where, getDocs } from "./firebase";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;

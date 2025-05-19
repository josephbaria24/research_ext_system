import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from "firebase/auth";
import { auth } from "../firebase"; 
import { FcGoogle } from "react-icons/fc"; 
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // 🔹 Toggle between Login & Sign Up
  const navigate = useNavigate(); 

  // 🔹 Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login successful!");
      navigate("/home"); // Navigate to Homepage
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  // 🔹 Sign Up Function (Handles 'Email Already in Use' Error)
  const handleSignUp = async (e) => {
    e.preventDefault(); // 🔹 Prevent default form submission
    setLoading(true);
    setError(null);
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      navigate("/home"); 
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  // 🔹 Google Login Function
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      alert("Google Sign-In successful!");
      navigate("/home"); 
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 via-white to-peach-100 px-4">
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-600 text-center mb-4">Research Extension System</h1>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={isSignUp ? (e) => handleSignUp(e) : handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-gray-700 placeholder-gray-400 border border-orange-300 focus:border-orange-500 focus:outline-none transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-white text-gray-700 placeholder-gray-400 border border-orange-300 focus:border-orange-500 focus:outline-none transition-all"
            required
          />
          <button 
            type="submit" 
            className={`w-full ${
              loading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
            } text-white py-3 rounded-lg transition duration-200`}
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </button>
        </form>

        <div className="text-center text-gray-500 my-4">or</div>

        <button 
          onClick={handleGoogleLogin} 
          className={`w-full flex items-center justify-center ${
            loading ? "bg-gray-200 cursor-not-allowed" : "bg-white hover:bg-gray-100"
          } text-gray-700 py-3 rounded-lg shadow-md transition duration-200`}
          disabled={loading}
        >
          <FcGoogle className="text-2xl mr-2" /> {loading ? "Processing..." : "Sign in with Google"}
        </button>

        {/* 🔹 Toggle between Login & Sign Up */}
        <div className="text-center mt-4">
          <p className="text-gray-700">
            {isSignUp ? "Already have an account?" : ""}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-orange-500 hover:text-orange-600 font-semibold transition"
          >
            {isSignUp ? "Log In" : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

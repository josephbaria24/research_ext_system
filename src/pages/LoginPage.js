import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // ✅ Allowed admin accounts
  const allowedAdmins = [
    { email: "resys@gmail.com", password: "123456789" },
    { email: "josephbaria89@gmail.com", password: "123456" },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isValidAdmin = allowedAdmins.find(
      (admin) => admin.email === email && admin.password === password
    );

    if (!isValidAdmin) {
      setError("Invalid credentials.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (error) {
      setError("Login failed. Please check your Firebase credentials.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-200 via-white to-peach-100 px-4">
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-xl shadow-xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-orange-600 text-center mb-4">Research Extension System</h1>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Admin Login</h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
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
            className={`w-full ${loading ? "bg-orange-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"} text-white py-3 rounded-lg transition duration-200`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

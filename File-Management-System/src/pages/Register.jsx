import React, { useState } from "react";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!name || !email || !password) return "All fields are required";
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 4) return "Password must be at least 4 characters";
    return "";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ Call backend
      const user = await AuthService.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      sessionStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="login-title">Create Account</h1>
        <p className="login-sub">Join FileManager 🚀</p>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <FiUser />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FiMail />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FiLock />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button className="login-btn" disabled={loading}>
            {loading ? (
              "Creating account..."
            ) : (
              <>
                <FiUserPlus style={{ marginRight: "6px" }} />
                Register
              </>
            )}
          </button>

          <p className="toggle">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Sign in</span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Register;

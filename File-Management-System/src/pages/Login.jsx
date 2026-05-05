import React, { useState } from "react";
import logo from "../assets/logo.png";
import { FiUser, FiLock, FiLogIn, FiEye, FiEyeOff } from "react-icons/fi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password) return "All fields are required";
    if (!email.includes("@")) return "Enter a valid email";
    if (password.length < 4) return "Password must be at least 4 characters";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await AuthService.login({ email, password });
      sessionStorage.setItem("user", JSON.stringify(user));

      // ✅ Apply THIS user's saved theme before navigating
      const savedTheme = localStorage.getItem(`theme_${user.id}`) || "light";
      document.body.setAttribute("data-theme", savedTheme);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
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
        <div className="login-brand">
          <img src={logo} alt="FileOrbit" className="login-logo" />
        </div>

        <p className="login-sub">Welcome back 👋</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <div className="input-group">
              <FiUser />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Password</label>
            <div className="input-group" style={{ position: "relative" }}>
              <FiLock />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  right: "10px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="login-btn" disabled={loading}>
            {loading ? (
              "Please wait..."
            ) : (
              <>
                <FiLogIn style={{ marginRight: "6px" }} />
                Sign In
              </>
            )}
          </button>

          <p className="toggle">
            New here?{" "}
            <span onClick={() => navigate("/register")}>Create account</span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;

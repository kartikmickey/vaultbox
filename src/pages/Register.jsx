import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Registration failed. " + err.message);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Register</h2>

      {error && <p style={errorStyle}>{error}</p>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />
      <button onClick={handleRegister} style={buttonStyle}>
        Register
      </button>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {/* <a href="/login" style={linkStyle}>
          Already have an account?
        </a> */}
        <button
          onClick={() => navigate("/login")}
          style={linkStyle}
        >
          Already have an account?
        </button>
      </div>
    </div>
  );
}

// ------------------ Styles ------------------

const containerStyle = {
  maxWidth: "400px",
  margin: "4rem auto",
  padding: "2rem",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#fff",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "1.5rem",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
  cursor: "pointer",
};

const errorStyle = {
  color: "red",
  marginBottom: "1rem",
};

const linkStyle = {
  color: "#007bff",
  textDecoration: "none",
  fontSize: "14px",
  background: "none",
  border: "none"
};

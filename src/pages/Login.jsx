import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc } from "firebase/firestore";
import { db } from "../firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (user) {
        const ref = doc(db, "trustedContacts", user.uid);
        // Optional: Update logic here
      }

      navigate("/");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("User not registered. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Login failed. " + err.message);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Login</h2>

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

      <button onClick={handleLogin} style={buttonStyle}>
        Login
      </button>

      <div style={footerLinksStyle}>
        {/* <a href="/register" style={linkStyle}>
          New User?
        </a> */}
        <button
          onClick={() => navigate("/register")}
          style={linkStyle}
        >
          New User?
        </button>
        <button
          onClick={() => navigate("/emergency-access")}
          style={secondaryButtonStyle}
        >
          Emergency Access
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
  marginBottom: "1rem",
};

const secondaryButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "14px",
};

const errorStyle = {
  color: "red",
  marginBottom: "1rem",
};

const footerLinksStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const linkStyle = {
  color: "#007bff",
  textDecoration: "none",
  fontSize: "14px",
  background: "none",
  border: "none"
};

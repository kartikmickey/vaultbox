// src/components/TrustedContact.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function TrustedContact() {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");

  const fetchTrusted = async (user) => {
    if (!user) return;
    const ref = doc(db, "trustedContacts", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setSavedEmail(snap.data().email);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    try {
      await setDoc(doc(db, "trustedContacts", user.uid), {
        uid: user.uid,
        email,
        assignedAt: serverTimestamp(),
        lastLoginTime: serverTimestamp(),
        unlockRequested: false,
      });
      setSavedEmail(email);
      setEmail("");
    } catch (error) {
      console.error("Failed to write to Firestore:", error.message, error.code);
      alert("Error saving trusted contact: " + error.message);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchTrusted(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Trusted Contact</h3>
      {savedEmail ? (
        <p style={savedTextStyle}>
          Trusted contact set to: <strong>{savedEmail}</strong>
        </p>
      ) : (
        <div style={formStyle}>
          <input
            placeholder="Trusted contact email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleSave} style={buttonStyle}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------- CSS Styles ----------------
const containerStyle = {
  marginTop: "1.5rem",
};

const headingStyle = {
  marginBottom: "0.5rem",
};

const savedTextStyle = {
  backgroundColor: "#f1f1f1",
  padding: "10px",
  borderRadius: "4px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "10px",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px",
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

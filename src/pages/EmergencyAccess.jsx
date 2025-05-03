// src/pages/EmergencyAccess.jsx
import { useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function EmergencyAccess() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleRequestAccess = async () => {
    setStatus("Checking...");

    try {
      const q = query(
        collection(db, "trustedContacts"),
        where("email", "==", email)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setStatus(
          "❌ No vault owner has assigned this email as a trusted contact."
        );
        return;
      }

      const data = snapshot.docs[0].data();
      const lastLogin = data.lastLoginTime?.toDate?.();
      const vaultOwner = data.uid;

      if (!lastLogin) {
        setStatus("❌ No login activity found for vault owner.");
        return;
      }

      const now = new Date();
      const diffInMs = now - lastLogin;
      const diffInMin = diffInMs / 60000;

      if (diffInMin >= 1) {
        setStatus("granted");
        await updateDoc(doc(db, "trustedContacts", vaultOwner), {
          unlockRequested: true,
        });
      } else {
        setStatus("⏳ Vault owner is still active. Try again later.");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Something went wrong. " + error.message);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Emergency Unlock Access</h2>
      <p>Enter your email if you're a trusted contact requesting access.</p>

      <div
        style={{
          display: "flex",
          marginTop: "1rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleRequestAccess} style={buttonStyle}>
          Request Unlock
        </button>
      </div>

      {/* Success UI */}
      {status === "granted" && (
        <div style={{ marginTop: "1rem", color: "green" }}>
          <p>✅ Access granted! Vault owner has been inactive for 1+ minute.</p>
          <p>
            The unlock request has been logged. VaultBox will review and notify
            the vault owner. Please follow up as instructed.
          </p>
        </div>
      )}

      {/* Error or Loading UI */}
      {status && status !== "granted" && (
        <p
          style={{
            marginTop: "1rem",
            color: status.startsWith("❌") ? "red" : "#555",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "2rem",
  fontFamily: "Arial, sans-serif",
};

const inputStyle = {
  flex: "1",
  padding: "10px",
  fontSize: "16px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  minWidth: "250px",
};

const buttonStyle = {
  padding: "10px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
};

const headerStyle = {
  fontSize: "1.5rem",
  marginBottom: "1rem",
  textAlign: "center",
};

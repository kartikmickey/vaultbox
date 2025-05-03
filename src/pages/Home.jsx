// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import CryptoJS from "crypto-js";
import VaultEntryForm from "../components/VaultEntryForm";
import { useNavigate } from "react-router-dom";
import TrustedContact from "../components/TrustedContact";
import { getDoc } from "firebase/firestore";

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const navigate = useNavigate();

  const fetchEntries = async (uid) => {
    const q = query(collection(db, "vaultEntries"), where("uid", "==", uid));
    const snapshot = await getDocs(q);
    const now = new Date();
    const validEntries = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const { title, encrypted, createdAt, expiresIn, category } = data;

      if (expiresIn && expiresIn > 0) {
        const expiryDate = createdAt.toDate();
        expiryDate.setMinutes(expiryDate.getMinutes() + expiresIn);
        if (now > expiryDate) {
          await deleteDoc(doc(db, "vaultEntries", docSnap.id));
          continue;
        }
      }

      validEntries.push({
        id: docSnap.id,
        title,
        encrypted,
        category,
      });
    }

    setEntries(validEntries);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const checkEmergencyUnlock = async () => {
          const ref = doc(db, "trustedContacts", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists() && snap.data().unlockRequested) {
            alert(
              "🚨 Emergency unlock request has been made by your trusted contact!"
            );
          }
        };
        checkEmergencyUnlock();
        fetchEntries(user.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, []);

  const decrypt = (encryptedText) => {
    const bytes = CryptoJS.AES.decrypt(encryptedText, "vaultbox-secret-key");
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Welcome to VaultBox</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <button onClick={handleLogout} style={buttonStyle}>
          Logout
        </button>
      </div>

      {/* Vault Entry Form */}
      <div style={formSectionStyle}>
        <VaultEntryForm
          onEntryAdded={() => fetchEntries(user.uid)}
          editingEntry={editingEntry}
          onSave={() => {
            setEditingEntry(null);
            fetchEntries(user.uid);
          }}
        />
      </div>

      {/* Trusted Contact Section */}
      <div style={formSectionStyle}>
        <TrustedContact />
      </div>

      {/* Vault Entries */}
      <h3 style={sectionTitleStyle}>Your Vault Entries</h3>
      {entries.length === 0 ? (
        <p style={{ color: "#666" }}>No entries yet.</p>
      ) : (
        <ul style={{ paddingLeft: "1rem", marginTop: "1rem" }}>
          {entries.map((entry) => {
            const decrypted = decrypt(entry.encrypted);
            return (
              <li
                key={entry.id}
                style={{
                  marginBottom: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{entry.title}</strong> ({entry.category}):{" "}
                  {decrypt(entry.encrypted)}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => setEditingEntry(entry)}
                    style={{
                      backgroundColor: "#ffc107",
                      color: "#000",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm("Delete this entry?")) {
                        await deleteDoc(doc(db, "vaultEntries", entry.id));
                        fetchEntries(user.uid);
                      }
                    }}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Emergency Access Button */}
      <div style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <button
          onClick={() => navigate("/emergency-access")}
          style={buttonStyle}
        >
          Emergency Access
        </button>
      </div>
    </div>
  );
}

// ---------- Styles ----------

const containerStyle = {
  maxWidth: "700px",
  margin: "0 auto",
  padding: "2rem",
  fontFamily: "Arial, sans-serif",
};

const headerStyle = {
  textAlign: "center",
  fontSize: "1.8rem",
  marginBottom: "1rem",
};

const sectionTitleStyle = {
  marginTop: "2rem",
  fontSize: "1.2rem",
  fontWeight: "bold",
  borderBottom: "1px solid #ccc",
  paddingBottom: "4px",
  marginBottom: "1rem",
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

const formSectionStyle = {
  border: "1px solid #ddd",
  padding: "1rem",
  borderRadius: "6px",
  marginBottom: "2rem",
  backgroundColor: "#f9f9f9",
};

// src/components/VaultEntryForm.jsx
import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import CryptoJS from "crypto-js";
import { addDoc, collection, Timestamp, updateDoc, doc } from "firebase/firestore";


export default function VaultEntryForm({
  onEntryAdded,
  editingEntry = null,
  onSave = () => {},
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Personal");
  const [expiry, setExpiry] = useState("0");


  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Not logged in");

    const encrypted = CryptoJS.AES.encrypt(
      content,
      "vaultbox-secret-key"
    ).toString();

    if (editingEntry) {
      // Update mode
      await updateDoc(doc(db, "vaultEntries", editingEntry.id), {
        title,
        category,
        encrypted,
        expiresIn: parseInt(expiry),
      });
      onSave(); // reset edit mode
    } else {
      // Add mode
      await addDoc(collection(db, "vaultEntries"), {
        uid: user.uid,
        title,
        category,
        encrypted,
        createdAt: Timestamp.now(),
        expiresIn: parseInt(expiry),
      });
      onEntryAdded(); // refresh list
    }

    // Clear form
    setTitle("");
    setContent("");
    setCategory("Personal");
    setExpiry("0");
  };

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title);
      setContent(
        CryptoJS.AES.decrypt(
          editingEntry.encrypted,
          "vaultbox-secret-key"
        ).toString(CryptoJS.enc.Utf8)
      );
      setCategory(editingEntry.category);
      setExpiry(editingEntry.expiresIn?.toString() || "0");
    }
  }, [editingEntry]);

  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Add Vault Entry</h3>

      <label style={labelStyle}>Title</label>
      <input
        placeholder="e.g. Passport Info"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />

      <label style={labelStyle}>Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={inputStyle}
      >
        <option value="Finance">Finance</option>
        <option value="Health">Health</option>
        <option value="Personal">Personal</option>
        <option value="Notes">Notes</option>
      </select>

      <label style={labelStyle}>Secret Content</label>
      <textarea
        placeholder="Secret content..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={textareaStyle}
      />

      <label style={labelStyle}>Auto-delete after:</label>
      <select
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
        style={inputStyle}
      >
        <option value="0">Never</option>
        <option value="1">1 minute</option>
        <option value="5">5 minutes</option>
        <option value="30">30 minutes</option>
      </select>

      <button onClick={handleSave} style={buttonStyle}>
        Save Encrypted Entry
      </button>
    </div>
  );
}

// ---------------- CSS Styles ----------------

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "1rem 0",
};

const headingStyle = {
  marginBottom: "0.5rem",
};

const labelStyle = {
  fontWeight: "bold",
  marginTop: "0.5rem",
};

const inputStyle = {
  padding: "10px",
  fontSize: "16px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

const textareaStyle = {
  minHeight: "80px",
  padding: "10px",
  fontSize: "16px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  resize: "vertical",
};

const buttonStyle = {
  marginTop: "1rem",
  padding: "10px",
  fontWeight: "bold",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

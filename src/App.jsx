// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import EmergencyAccess from "./pages/EmergencyAccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/emergency-access" element={<EmergencyAccess />} />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;

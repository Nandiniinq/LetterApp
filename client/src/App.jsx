import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initializeGapi } from "./utils/googleDrive";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LetterEditor from "./pages/Editor";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<LetterEditor />} />
      </Routes>
    </Router>
  );
};

export default App;

import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import EngineEditor from "./pages/EngineEditor.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/engine-editor" element={<EngineEditor />} />
    </Routes>
  );
}

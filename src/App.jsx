import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import EngineEditor from "./pages/EngineEditor.jsx";
import Documentation from "./pages/Documentation";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/engine-editor" element={<EngineEditor />} />
      <Route path="/documentation" element={<Documentation />} />
    </Routes>
  );
}



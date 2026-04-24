import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ManajemenPengajar from './pages/admin/ManajemenPengajar';
import ManajemenKursus from './pages/admin/ManajemenKursus';
import AIKnowledge from './pages/admin/AIKnowledge';
import AutoCorrection from './pages/admin/AutoCorrection';
import LaporanAkhir from './pages/admin/LaporanAkhir';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/pengajar" replace />} />
        <Route path="/admin/pengajar" element={<ManajemenPengajar />} />
        <Route path="/admin/kursus" element={<ManajemenKursus />} />
        <Route path="/admin/ai-knowledge" element={<AIKnowledge />} />
        <Route path="/admin/auto-correction" element={<AutoCorrection />} />
        <Route path="/admin/end-kursus" element={<LaporanAkhir />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/admin/pengajar" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ManajemenPengajar from './pages/admin/ManajemenPengajar';
import ManajemenKursus from './pages/admin/ManajemenKursus';
import ManajemenJadwal from './pages/admin/ManajemenJadwal';
import ManajemenMateri from './pages/admin/ManajemenMateri';
import BuatKursus from './pages/admin/BuatKursus';
import AIKnowledge from './pages/admin/AIKnowledge';
import AutoCorrection from './pages/admin/AutoCorrection';
import LaporanAkhir from './pages/admin/LaporanAkhir';
import AddMateriAdmin from './pages/admin/AddMateri';
import CourseMap from './pages/admin/CourseMap';
import DashboardAsisten from './pages/asisten/DashboardAsisten';
import HalamanKoreksi from './pages/asisten/HalamanKoreksi';
import AutoCorrectionAsisten from './pages/asisten/AutoCorrectionAsisten';
import MonitoringMahasiswa from './pages/pengajar/MonitoringMahasiswa';
import AddMateri from './pages/pengajar/AddMateri';
import KoreksiUploadDetail from './pages/asisten/KoreksiUploadDetail';
import KursusTersedia from './pages/user/KursusTersedia';
import DetailKursus from './pages/user/DetailKursus';
import UjianPage from './pages/user/UjianPage';
import HasilSkorAI from './pages/user/HasilSkorAI';
import UserProfile from './pages/user/UserProfile';
import MateriSesi from './pages/user/MateriSesi';
import ViewPDF from './pages/user/ViewPDF';
import KelasOnline from './pages/user/KelasOnline';
import AdminLayout from './layouts/AdminLayout';





const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) => {
  const role = localStorage.getItem('userRole');
  if (!role) return <Navigate to="/login" replace />;
  if (role !== allowedRole) {
    const defaultPath = role === 'admin' ? '/admin/pengajar' : (role === 'asisten' ? '/asisten/dashboard' : '/user/dashboard');
    return <Navigate to={defaultPath} replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/pengajar" element={<ProtectedRoute allowedRole="admin"><ManajemenPengajar /></ProtectedRoute>} />
        <Route path="/admin/kursus" element={<ProtectedRoute allowedRole="admin"><ManajemenKursus /></ProtectedRoute>} />
        <Route path="/admin/kursus/baru" element={<ProtectedRoute allowedRole="admin"><BuatKursus /></ProtectedRoute>} />
        <Route path="/admin/jadwal" element={<ProtectedRoute allowedRole="admin"><ManajemenJadwal /></ProtectedRoute>} />
        <Route path="/admin/materi" element={<ProtectedRoute allowedRole="admin"><ManajemenMateri /></ProtectedRoute>} />
        <Route path="/admin/materi/add" element={<ProtectedRoute allowedRole="admin"><AddMateriAdmin /></ProtectedRoute>} />
        <Route path="/admin/ai-knowledge" element={<ProtectedRoute allowedRole="admin"><AIKnowledge /></ProtectedRoute>} />
        <Route path="/admin/auto-correction" element={<ProtectedRoute allowedRole="admin"><AutoCorrection /></ProtectedRoute>} />
        <Route path="/admin/end-kursus" element={<ProtectedRoute allowedRole="admin"><LaporanAkhir /></ProtectedRoute>} />
        <Route path="/admin/course-map" element={<ProtectedRoute allowedRole="admin"><CourseMap /></ProtectedRoute>} />

        {/* Pengajar Routes */}
        <Route path="/pengajar/dashboard" element={<ProtectedRoute allowedRole="pengajar"><DashboardAsisten /></ProtectedRoute>} />
        <Route path="/pengajar/monitoring" element={<ProtectedRoute allowedRole="pengajar"><MonitoringMahasiswa /></ProtectedRoute>} />
        <Route path="/pengajar/add-materi" element={<ProtectedRoute allowedRole="pengajar"><AddMateri /></ProtectedRoute>} />
        <Route path="/pengajar/jadwal" element={<ProtectedRoute allowedRole="pengajar"><div className="p-8"><h1 className="text-2xl font-bold">Jadwal Pengajar</h1><p className="text-gray-500">Halaman jadwal pengajar sedang dalam pengembangan.</p></div></ProtectedRoute>} />

        {/* Asisten Routes */}
        <Route path="/asisten/dashboard" element={<ProtectedRoute allowedRole="asisten"><DashboardAsisten /></ProtectedRoute>} />
        <Route path="/asisten/koreksi" element={<ProtectedRoute allowedRole="asisten"><HalamanKoreksi /></ProtectedRoute>} />
        <Route path="/asisten/upload" element={<ProtectedRoute allowedRole="asisten"><KoreksiUploadDetail /></ProtectedRoute>} />
        <Route path="/asisten/auto-correction" element={<ProtectedRoute allowedRole="asisten"><AutoCorrectionAsisten /></ProtectedRoute>} />
        <Route path="/asisten/jadwal" element={<ProtectedRoute allowedRole="asisten"><div className="p-8"><h1 className="text-2xl font-bold">Jadwal Asisten</h1><p className="text-gray-500">Halaman jadwal asisten sedang dalam pengembangan.</p></div></ProtectedRoute>} />


        {/* User (Mahasiswa) Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute allowedRole="user"><KursusTersedia /></ProtectedRoute>} />
        <Route path="/user/kursus-saya" element={<ProtectedRoute allowedRole="user"><div className="p-8"><h1 className="text-2xl font-bold">Kursus Saya</h1><p className="text-gray-500">Halaman kursus yang telah Anda ambil.</p></div></ProtectedRoute>} />
        <Route path="/user/detail-kursus" element={<ProtectedRoute allowedRole="user"><DetailKursus /></ProtectedRoute>} />
        <Route path="/user/materi-sesi" element={<ProtectedRoute allowedRole="user"><MateriSesi /></ProtectedRoute>} />
        <Route path="/user/view-pdf" element={<ProtectedRoute allowedRole="user"><ViewPDF /></ProtectedRoute>} />
        <Route path="/user/kelas-online" element={<ProtectedRoute allowedRole="user"><KelasOnline /></ProtectedRoute>} />
        <Route path="/user/ujian" element={<ProtectedRoute allowedRole="user"><UjianPage /></ProtectedRoute>} />
        <Route path="/user/hasil-skor" element={<ProtectedRoute allowedRole="user"><HasilSkorAI /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>} />
        <Route path="/user/materi" element={<ProtectedRoute allowedRole="user"><div className="p-8"><h1 className="text-2xl font-bold">Materi</h1><p className="text-gray-500">Daftar materi pembelajaran.</p></div></ProtectedRoute>} />





        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}


export default App;




import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineUserGroup, 
  HiOutlineBookOpen, 
  HiOutlineCalendar, 
  HiOutlineClipboardDocumentList, 
  HiOutlineChartBar,
  HiOutlineCpuChip,
  HiOutlineSparkles,
  HiOutlineArchiveBoxXMark,
  HiOutlineSquares2X2,
  HiOutlinePencilSquare,
  HiOutlineArrowLeftOnRectangle,
  HiOutlinePlus,
  HiOutlineHome,
  HiOutlineQueueList,
  HiOutlineUser
} from 'react-icons/hi2';




const Sidebar: React.FC = () => {
  const role = localStorage.getItem('userRole') || 'admin';

  const adminMenuItems = [
    { name: 'PENGAJAR', icon: <HiOutlineUserGroup />, path: '/admin/pengajar' },
    { name: 'Kursus', icon: <HiOutlineBookOpen />, path: '/admin/kursus' },
    { name: 'Jadwal', icon: <HiOutlineCalendar />, path: '/admin/jadwal' },
    { name: 'Materi', icon: <HiOutlineClipboardDocumentList />, path: '/admin/materi' },
  ];

  const adminAiItems = [
    { name: 'AI Knowledge', icon: <HiOutlineCpuChip />, path: '/admin/ai-knowledge' },
    { name: 'Auto Correction', icon: <HiOutlineSparkles />, path: '/admin/auto-correction' },
  ];

  const userMenuItems = [
    { name: 'Dashboard', icon: <HiOutlineHome />, path: '/user/dashboard' },
    { name: 'Kursus Saya', icon: <HiOutlineBookOpen />, path: '/user/kursus-saya' },
    { name: 'Materi', icon: <HiOutlineQueueList />, path: '/user/materi' },
    { name: 'Profile', icon: <HiOutlineUser />, path: '/user/profile' },
    { name: 'Jadwal', icon: <HiOutlineCalendar />, path: '/user/jadwal' },
  ];


  const asistenMenuItems = [
    { name: 'Dashboard', icon: <HiOutlineSquares2X2 />, path: '/asisten/dashboard' },
    { name: 'Koreksi Manual', icon: <HiOutlinePencilSquare />, path: '/asisten/koreksi' },
    { name: 'Auto Correction AI', icon: <HiOutlineSparkles />, path: '/asisten/auto-correction' },
    { name: 'Jadwal', icon: <HiOutlineCalendar />, path: '/asisten/jadwal' },
  ];

  const pengajarMenuItems = [
    { name: 'Dashboard', icon: <HiOutlineSquares2X2 />, path: '/pengajar/dashboard' },
    { name: 'Monitoring', icon: <HiOutlineChartBar />, path: '/pengajar/monitoring' },
    { name: 'Add Materi', icon: <HiOutlinePlus />, path: '/pengajar/add-materi' },
    { name: 'Jadwal', icon: <HiOutlineCalendar />, path: '/pengajar/jadwal' },
  ];

  const menuItems = 
    role === 'admin' ? adminMenuItems : 
    role === 'pengajar' ? pengajarMenuItems :
    role === 'asisten' ? asistenMenuItems : 
    userMenuItems;

  const aiItems = role === 'admin' ? adminAiItems : [];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-100">L</div>
        <span className="font-bold text-gray-800 tracking-tight text-lg">HYBRID LMS</span>
      </div>

      {/* User Info */}
      <div className="p-6 overflow-y-auto flex-1">
        <div className="flex items-center gap-3 mb-8 bg-gray-50 p-4 rounded-xl">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-xl overflow-hidden border-2 border-white shadow-sm">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role === 'admin' ? 'Admin' : (role === 'asisten' ? 'Asisten' : 'User')}`} alt="avatar" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-[10px] uppercase">
              {role === 'admin' ? 'Admin Kursus' : (role === 'asisten' ? 'Asisten Dosen' : 'Mahasiswa')}
            </div>
            <div className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
              {role === 'admin' ? 'Super Admin' : (role === 'asisten' ? 'Assistant' : 'Student')}
            </div>
          </div>
        </div>


        {/* Menu Utama */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Menu Utama</p>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                      : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* AI Section (Only for Admin) */}
        {aiItems.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">AI Module</p>
            <nav className="space-y-1">
              {aiItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-100'
                        : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Laporan (Only for Admin) */}
        {role === 'admin' && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Laporan</p>
            <nav className="space-y-1">
              <NavLink
                to="/admin/end-kursus"
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-red-500 text-white shadow-lg shadow-red-100'
                      : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                  }`
                }
              >
                <span className="text-xl"><HiOutlineArchiveBoxXMark /></span>
                End Kursus
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <HiOutlineArrowLeftOnRectangle className="text-lg" />
          Logout
        </button>
        <div className="text-[10px] text-gray-400 text-center">
          &copy; 2026 LMS Hybrid Skripsi
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


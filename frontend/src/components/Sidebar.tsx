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
import { useAuthStore } from '../store/useAuthStore';




const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = localStorage.getItem('userRole') || 'admin';
  const isAdmin = role.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin';

  const adminSections = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Pengajar', icon: <HiOutlineUserGroup />, path: '/admin/pengajar' },
        { name: 'Kursus', icon: <HiOutlineBookOpen />, path: '/admin/kursus' },
        { name: 'Course Map', icon: <HiOutlineQueueList />, path: '/admin/course-map' },
        { name: 'Jadwal', icon: <HiOutlineCalendar />, path: '/admin/jadwal' },
        { name: 'Materi', icon: <HiOutlineClipboardDocumentList />, path: '/admin/materi' },
      ]
    },
    {
      title: 'AI MODULE',
      items: [
        { name: 'AI Review Queue', icon: <HiOutlineCpuChip />, path: '/admin/ai-knowledge' },
        { name: 'Auto Correction', icon: <HiOutlineSparkles />, path: '/admin/auto-correction' },
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { name: 'End Kursus', icon: <HiOutlineChartBar />, path: '/admin/end-kursus' },
      ]
    }
  ];

  const userSections = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Kursus Tersedia', icon: <HiOutlineSquares2X2 />, path: '/user/dashboard' },
        { name: 'My courses', icon: <HiOutlineBookOpen />, path: '/user/kursus-saya' },
      ]
    },
    {
      title: 'AI MODULE',
      items: [
        { name: 'Ujian AI', icon: <HiOutlineCpuChip />, path: '/user/ujian' },
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { name: 'Hasil & Sertifikat', icon: <HiOutlineChartBar />, path: '/user/hasil-skor' },
        { name: 'Profile', icon: <HiOutlineUser />, path: '/user/profile' },
      ]
    }
  ];

  const asistenSections = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Koreksi Manual', icon: <HiOutlinePencilSquare />, path: '/asisten/koreksi' },
        { name: 'Koreksi Upload', icon: <HiOutlineClipboardDocumentList />, path: '/asisten/upload' },
      ]
    },
    {
      title: 'AI MODULE',
      items: [
        { name: 'Auto Correction', icon: <HiOutlineSparkles />, path: '/asisten/auto-correction' },
      ]
    }
  ];

  const pengajarMenuItems = [
    { name: 'Monitoring', icon: <HiOutlineChartBar />, path: '/pengajar/monitoring' },
    { name: 'Add Materi', icon: <HiOutlinePlus />, path: '/pengajar/add-materi' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  const isStudent = role === 'user' || role === 'mahasiswa';
  const isAsisten = role === 'asisten';
  const isBlueTheme = true; // Always blue theme to match other roles and the image design

  return (
    <div className={`w-80 flex flex-col h-screen sticky top-0 z-30 transition-all overflow-hidden ${
      isBlueTheme ? 'bg-[#357ABD] text-white shadow-2xl' : 'bg-white border-r border-gray-200 text-gray-800'
    }`}>
      {/* Brand Section */}
      <div className={`p-10 flex items-center gap-4 shrink-0 ${isBlueTheme ? '' : 'border-b border-gray-100'}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-2xl shrink-0 ${
          isBlueTheme ? 'bg-white text-[#357ABD]' : 'bg-emerald-500 text-white'
        }`}>
          L
        </div>
        <span className={`font-black tracking-tighter text-xl whitespace-nowrap ${isBlueTheme ? 'text-white' : 'text-gray-900'}`}>
          HYBRID LMS
        </span>
      </div>

      {/* User Info Card */}
      <div className="px-8 mb-6 shrink-0">
        <div className={`flex items-center gap-4 p-5 rounded-[2.5rem] shadow-inner transition-all hover:scale-[1.02] ${
          isBlueTheme ? 'bg-white/10 backdrop-blur-xl border border-white/10' : 'bg-gray-50 border border-gray-100'
        }`}>
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-2xl shrink-0">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.nama || 'Mahasiswa')}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <div className={`font-black text-xs truncate uppercase tracking-tight ${isBlueTheme ? 'text-white' : 'text-gray-900'}`}>
               {(() => {
                 const rawName = user?.nama || localStorage.getItem('userName') || 'User';
                 const isSuperAdmin = rawName.toLowerCase().replace(/\s+/g, '') === 'superadmin';
                 return isSuperAdmin ? 'Admin Kursus' : rawName;
               })()}
            </div>
            {!isAdmin && (
              <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isBlueTheme ? 'text-blue-100/70' : 'text-emerald-600'}`}>
                 {user?.gelar || (role === 'pengajar' ? 'Dosen' : (isAsisten ? 'Asisten Dosen' : 'Peserta'))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Area with Custom Scrollbar */}
      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all pb-10">
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        
        {role === 'admin' ? (
          adminSections.map((section) => (
            <div key={section.title} className="mb-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-6 px-6">{section.title}</p>
              <nav className="space-y-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-[#357ABD] shadow-2xl shadow-blue-900/30 scale-[1.03]'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))
        ) : isAsisten ? (
          asistenSections.map((section) => (
            <div key={section.title} className="mb-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-6 px-6">{section.title}</p>
              <nav className="space-y-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-[#357ABD] shadow-2xl shadow-blue-900/30 scale-[1.03]'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))
        ) : role === 'pengajar' ? (
          <div className="mb-10">
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-6 px-6">MENU UTAMA</p>
            <nav className="space-y-2">
              {pengajarMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? 'bg-white text-[#357ABD] shadow-2xl shadow-blue-900/30 scale-[1.03]'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : isStudent ? (
          userSections.map((section) => (
            <div key={section.title} className="mb-10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-6 px-6">{section.title}</p>
              <nav className="space-y-2">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-6 py-4 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                        isActive
                          ? 'bg-white text-[#357ABD] shadow-2xl shadow-blue-900/30 scale-[1.03]'
                          : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))
        ) : null}
      </div>

      {/* Logout Section */}
      <div className={`p-8 ${isBlueTheme ? 'bg-black/5' : 'border-t border-gray-50'}`}>
        <button 
          onClick={handleLogout}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
            isBlueTheme ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <HiOutlineArrowLeftOnRectangle className="text-xl" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


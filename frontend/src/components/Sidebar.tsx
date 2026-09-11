import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiOutlineUserGroup, 
  HiOutlineBookOpen, 
  HiOutlineCalendar, 
  HiOutlineClipboardDocumentList, 
  HiOutlineChartBar,
  HiOutlineCpuChip,
  HiOutlineSquares2X2,
  HiOutlinePencilSquare,
  HiOutlinePlus,
  HiOutlineQueueList,
  HiOutlineUser,
  HiOutlineAcademicCap,
} from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';
import logoImg from '../assets/logo.png';

const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
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
        { name: 'Enroll Paket', icon: <HiOutlineAcademicCap />, path: '/user/dashboard?tab=paket' },
        { name: 'My courses', icon: <HiOutlineBookOpen />, path: '/user/kursus-saya' },
        { name: 'Ujian', icon: <HiOutlineCpuChip />, path: '/user/ujian' },
      ]
    },
    {
      title: 'LAPORAN',
      items: [
        { name: 'Hasil & Sertifikat', icon: <HiOutlineChartBar />, path: '/user/hasil-skor' },
      ]
    }
  ];

  const asistenSections = [
    {
      title: 'MENU UTAMA',
      items: [
        { name: 'Koreksi', icon: <HiOutlinePencilSquare />, path: '/asisten/koreksi' },
        { name: 'Koreksi Upload', icon: <HiOutlineClipboardDocumentList />, path: '/asisten/upload' },
      ]
    }
  ];

  const pengajarMenuItems = [
    { name: 'Monitoring', icon: <HiOutlineChartBar />, path: '/pengajar/monitoring' },
    { name: 'Add Materi', icon: <HiOutlinePlus />, path: '/pengajar/add-materi' },
  ];



  const isStudent = role === 'user' || role === 'mahasiswa';
  const isAsisten = role === 'asisten';
  const isBlueTheme = false;

  const getLinkClass = (isActive: boolean) => {
    const base = "flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200";
    if (isBlueTheme) {
      return `${base} ${
        isActive
          ? 'bg-white text-[#357ABD] shadow-md scale-[1.01]'
          : 'text-blue-100 hover:bg-white/10 hover:text-white'
      }`;
    } else {
      return `${base} ${
        isActive
          ? 'bg-[#E3EDF7] text-[#357ABD]'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`;
    }
  };

  return (
    <div className={`w-72 flex flex-col h-[calc(100vh-5rem)] sticky top-20 z-20 transition-all overflow-hidden ${
      isBlueTheme ? 'bg-[#357ABD] text-white shadow-2xl' : 'bg-white border-r border-gray-150 text-gray-800'
    }`}>
      {/* Brand Section - Matches Navbar Height (h-20) */}
      <div className={`h-20 px-6 flex items-center gap-3 shrink-0 ${isBlueTheme ? '' : 'border-b border-gray-100'}`}>
        <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm shrink-0 bg-white p-0.5 border border-slate-100">
          <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <span className={`font-black tracking-tight text-lg whitespace-nowrap ${isBlueTheme ? 'text-white' : 'text-slate-800'}`}>
          HybridLMS
        </span>
      </div>

      {/* User Info Card */}
      <div className="px-4 py-4 shrink-0">
        <div className={`flex items-center gap-3.5 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${
          isBlueTheme ? 'bg-white/10 border-white/10 text-white' : 'bg-[#E3EDF7]/70 border border-blue-100/40 text-slate-800'
        }`}>
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/50 shadow-sm shrink-0 bg-white">
            <img 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.nama || 'Mahasiswa')}`} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <div className={`font-bold text-xs truncate uppercase tracking-wider ${isBlueTheme ? 'text-white' : 'text-slate-800'}`}>
               {(() => {
                  const rawName = user?.nama || localStorage.getItem('userName') || 'User';
                  const isSuperAdmin = rawName.toLowerCase().replace(/\s+/g, '') === 'superadmin';
                  return isSuperAdmin ? 'Admin Kursus' : rawName;
               })()}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isBlueTheme ? 'text-blue-100/70' : 'text-[#357ABD]'}`}>
               {isAdmin ? 'Administrator' : (user?.gelar || (role === 'pengajar' ? 'Dosen' : (isAsisten ? 'Asisten Dosen' : 'Peserta')))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Area with Custom Scrollbar */}
      <div className="flex-1 px-3 overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all pb-10">
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
        
        {role === 'admin' ? (
          adminSections.map((section) => (
            <div key={section.title} className="mb-8">
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 px-4 ${isBlueTheme ? 'text-white/40' : 'text-slate-400'}`}>{section.title}</p>
              <nav className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    <span className="text-xl text-slate-400 group-hover:text-slate-600">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))
        ) : isAsisten ? (
          asistenSections.map((section) => (
            <div key={section.title} className="mb-8">
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 px-4 ${isBlueTheme ? 'text-white/40' : 'text-slate-400'}`}>{section.title}</p>
              <nav className="space-y-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => getLinkClass(isActive)}
                  >
                    <span className="text-xl text-slate-400 group-hover:text-slate-600">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))
        ) : role === 'pengajar' ? (
          <div className="mb-8">
            <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 px-4 ${isBlueTheme ? 'text-white/40' : 'text-slate-400'}`}>MENU UTAMA</p>
            <nav className="space-y-1.5">
              {pengajarMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => getLinkClass(isActive)}
                >
                  <span className="text-xl text-slate-400 group-hover:text-slate-600">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : isStudent ? (
          userSections.map((section) => (
            <div key={section.title} className="mb-8">
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 px-4 ${isBlueTheme ? 'text-white/40' : 'text-slate-400'}`}>{section.title}</p>
              <nav className="space-y-1.5">
                {section.items.map((item) => {
                  const isQueryActive = (() => {
                    if (item.path === '/user/dashboard?tab=paket') {
                      return location.pathname === '/user/dashboard' && location.search.includes('tab=paket');
                    }
                    if (item.path === '/user/dashboard') {
                      return location.pathname === '/user/dashboard' && !location.search.includes('tab=paket');
                    }
                    return location.pathname === item.path;
                  })();

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      className={() => getLinkClass(isQueryActive)}
                    >
                      <span className="text-xl text-slate-400 group-hover:text-slate-600">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))
        ) : null}
      </div>
    </div>
  );
};

export default Sidebar;

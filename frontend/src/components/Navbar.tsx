import React from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3BottomLeft } from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const role = localStorage.getItem('userRole') || 'admin';
  const isAdmin = role.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin';
  const isStudent = true; // Always use student-like blue theme styles to match other roles and the image design

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.nama || 'Mahasiswa')}`;
  const avatarUrl = user?.avatar || defaultAvatar;

  return (
    <div className={`h-20 flex items-center justify-between px-10 sticky top-0 z-20 transition-all bg-[#357ABD] text-white shadow-sm`}>
      <div className="flex items-center gap-10 flex-1">
        <button className="text-white hover:text-blue-100 text-2xl transition-all">
          <HiOutlineBars3BottomLeft />
        </button>
        
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <HiOutlineMagnifyingGlass className="text-lg" />
          </span>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 rounded-full text-xs font-bold transition-all focus:outline-none focus:ring-4 bg-white text-gray-900 placeholder-gray-400 focus:ring-white/20 shadow-inner"
            placeholder="Search Anything..."
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-2 rounded-full relative transition-all text-xl text-white hover:bg-white/10">
          <HiOutlineBell />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 bg-orange-400 border-[#357ABD]"></span>
        </button>
        
        <div className="h-8 w-px mx-2 bg-white/20"></div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-black uppercase tracking-tight text-white">
               {(() => {
                 const rawName = user?.nama || localStorage.getItem('userName') || 'User';
                 const isSuperAdmin = rawName.toLowerCase().replace(/\s+/g, '') === 'superadmin';
                 return isSuperAdmin ? 'Admin Kursus' : rawName;
               })()}
            </div>
            {!isAdmin && (
              <div className="text-[9px] font-bold uppercase tracking-widest text-blue-150">
                 {user?.gelar || 'Mahasiswa'}
              </div>
            )}
          </div>
          <div className="w-12 h-12 border-2 rounded-2xl overflow-hidden shadow-lg border-white/50 bg-white/10">
            <img 
              src={avatarUrl} 
              alt="avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;


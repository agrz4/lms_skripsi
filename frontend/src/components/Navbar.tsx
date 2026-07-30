import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineBell, 
  HiOutlineBars3BottomLeft, 
  HiOutlineChevronDown, 
  HiOutlineArrowLeftOnRectangle,
  HiOutlineUser
} from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const role = localStorage.getItem('userRole') || 'admin';
  const isAdmin = role.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'admin';

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.nama || 'Mahasiswa')}`;
  const avatarUrl = user?.avatar || defaultAvatar;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={`h-20 flex items-center justify-between px-10 sticky top-0 z-30 transition-all bg-[#357ABD] text-white shadow-sm`}>
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
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-4 focus:outline-none group cursor-pointer text-left"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black uppercase tracking-tight text-white">
                 {(() => {
                   const rawName = user?.nama || localStorage.getItem('userName') || 'User';
                   const isSuperAdmin = rawName.toLowerCase().replace(/\s+/g, '') === 'superadmin';
                   return isSuperAdmin ? 'Admin Kursus' : rawName;
                 })()}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-blue-150">
                {user?.email || (role === 'admin' ? 'admin@hybridlms.ac.id' : 'student@hybridlms.ac.id')}
              </div>
            </div>
            <div className="w-12 h-12 border-2 rounded-full overflow-hidden shadow-lg border-white/50 bg-white/10 flex items-center justify-center transition-transform group-hover:scale-105">
              <img 
                src={avatarUrl} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <HiOutlineChevronDown className={`text-white text-sm transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-3.5 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-2">
                <div className="font-bold text-sm text-slate-900 truncate">
                  {(() => {
                    const rawName = user?.nama || localStorage.getItem('userName') || 'User';
                    const isSuperAdmin = rawName.toLowerCase().replace(/\s+/g, '') === 'superadmin';
                    return isSuperAdmin ? 'Admin Kursus' : rawName;
                  })()}
                </div>
                <div className="text-xs text-slate-400 truncate mt-0.5">
                  {user?.email || (role === 'admin' ? 'admin@hybridlms.ac.id' : 'student@hybridlms.ac.id')}
                </div>
              </div>
              
              <div className="border-t border-gray-200 my-3"></div>

              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-5 py-2 flex items-center gap-3 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors duration-150 text-left mb-1"
              >
                <HiOutlineUser className="text-lg text-slate-500" />
                <span>Edit Profil</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full px-5 py-2 flex items-center gap-3 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors duration-150 text-left"
              >
                <HiOutlineArrowLeftOnRectangle className="text-lg" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;


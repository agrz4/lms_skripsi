import React from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3BottomLeft } from 'react-icons/hi2';
import { useAuthStore } from '../store/useAuthStore';

const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const role = localStorage.getItem('userRole') || 'admin';
  const isStudent = role === 'user' || role === 'mahasiswa';

  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.nama || 'Mahasiswa')}`;
  const avatarUrl = user?.avatar || defaultAvatar;

  return (
    <div className={`h-20 flex items-center justify-between px-10 sticky top-0 z-20 transition-all ${
      isStudent ? 'bg-[#357ABD] text-white' : 'bg-white border-b border-gray-200'
    }`}>
      <div className="flex items-center gap-10 flex-1">
        {!isStudent && (
          <button className="text-gray-500 hover:text-emerald-600 text-2xl transition-all">
            <HiOutlineBars3BottomLeft />
          </button>
        )}
        
        <div className="relative w-full max-w-xl">
          <span className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isStudent ? 'text-gray-400' : 'text-gray-400'}`}>
            <HiOutlineMagnifyingGlass className="text-lg" />
          </span>
          <input
            type="text"
            className={`block w-full pl-12 pr-4 py-3 rounded-2xl text-xs font-bold transition-all focus:outline-none focus:ring-4 ${
              isStudent 
                ? 'bg-white text-gray-900 placeholder-gray-400 focus:ring-white/20' 
                : 'bg-gray-50 border border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'
            }`}
            placeholder="Search Anything..."
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className={`p-2 rounded-full relative transition-all text-xl ${
          isStudent ? 'text-white hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
        }`}>
          <HiOutlineBell />
          <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full border-2 ${
            isStudent ? 'bg-orange-400 border-[#357ABD]' : 'bg-emerald-500 border-white'
          }`}></span>
        </button>
        
        <div className={`h-8 w-px mx-2 ${isStudent ? 'bg-white/20' : 'bg-gray-200'}`}></div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className={`text-xs font-black uppercase tracking-tight ${isStudent ? 'text-white' : 'text-gray-900'}`}>
               {user?.nama || localStorage.getItem('userName') || 'User'}
            </div>
            <div className={`text-[9px] font-bold uppercase tracking-widest ${isStudent ? 'text-blue-100' : 'text-gray-400'}`}>
               {user?.gelar || (role === 'admin' ? 'Super Admin' : 'Mahasiswa')}
            </div>
          </div>
          <div className={`w-12 h-12 border-2 rounded-2xl overflow-hidden shadow-lg ${
            isStudent ? 'border-white/50 bg-white/10' : 'border-gray-100 bg-gray-50'
          }`}>
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


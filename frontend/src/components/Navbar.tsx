import React from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineBell, HiOutlineBars3BottomLeft } from 'react-icons/hi2';

const Navbar: React.FC = () => {
  const role = localStorage.getItem('userRole') || 'admin';

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-6 flex-1">
        <button className="text-gray-500 hover:text-emerald-600 text-2xl transition-all">
          <HiOutlineBars3BottomLeft />
        </button>
        
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <HiOutlineMagnifyingGlass />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            placeholder="Search anything..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-all text-xl">
          <HiOutlineBell />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900 capitalize">{role}</div>
            <div className="text-[10px] text-gray-400 font-medium">Role: {role.charAt(0).toUpperCase() + role.slice(1)}</div>
          </div>
          <div className={`w-10 h-10 border-2 rounded-full overflow-hidden ${
            role === 'admin' ? 'bg-emerald-100 border-emerald-500' : 
            role === 'pengajar' ? 'bg-yellow-100 border-yellow-500' :
            role === 'asisten' ? 'bg-purple-100 border-purple-500' : 
            'bg-blue-100 border-blue-500'
          }`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
              role === 'admin' ? 'Admin' : 
              role === 'pengajar' ? 'Teacher' : 
              role === 'asisten' ? 'Asisten' : 
              'User'
            }`} alt="avatar" />
          </div>


        </div>
      </div>
    </div>
  );
};

export default Navbar;


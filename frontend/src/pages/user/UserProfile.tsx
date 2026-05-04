import React from 'react';
import { HiOutlineCamera, HiOutlineUser, HiOutlineEnvelope, HiOutlineBuildingOffice, HiOutlinePhone, HiOutlineLockClosed } from 'react-icons/hi2';

const UserProfile: React.FC = () => {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Data Profile</h1>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl p-12 max-w-5xl border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Side - Avatar */}
          <div className="relative group">
            <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-blue-100 border-4 border-white overflow-hidden group-hover:opacity-90 transition-all">
              BS
            </div>
            <button className="absolute bottom-1 right-1 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-blue-600 border border-gray-100 transition-all">
              <HiOutlineCamera className="text-2xl" />
            </button>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 space-y-10 w-full">


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Nama Lengkap</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    defaultValue="Budi Santoso"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Email</label>
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="email"
                    defaultValue="budi@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Instansi</label>
                <div className="relative">
                  <HiOutlineBuildingOffice className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    defaultValue="Universitas ABC"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Nomor WhatsApp</label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    defaultValue="0812-3456-7890"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-50">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Ganti Password</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Password Lama</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="password"
                      defaultValue="........"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Password Baru</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="password"
                      defaultValue="........"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block px-1">Konfirmasi</label>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="password"
                      defaultValue="........"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <button className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

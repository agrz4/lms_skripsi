import React, { useState } from 'react';
import { 
  HiOutlinePlus, 
  HiOutlineCheck, 
  HiOutlineClock,
  HiOutlineLockClosed
} from 'react-icons/hi2';

const CourseMap: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Course Map — Web Development Path</h1>
        <p className="text-sm text-gray-500 font-medium">Atur urutan dan alur kursus. Sambungkan kursus dari level ke level berikutnya</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content - Flow Map */}
        <div className="xl:col-span-9 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-lg font-bold text-gray-900">Alur Kurikulum — Web Development</h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              <HiOutlinePlus className="text-sm" /> Tambah Node
            </button>
          </div>

          {/* Level 1 - Beginner */}
          <div className="relative mb-16">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white px-4 py-1 text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest border border-indigo-100 rounded-full shadow-sm flex items-center gap-1">
                🎯 Level 1 — Beginner
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 relative z-10">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl border-2 border-indigo-600 p-6 shadow-xl shadow-indigo-50 relative group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">
                  <HiOutlineCheck />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">HTML & CSS Dasar</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-3">WD-01 · 14 pertemuan</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md text-[9px] font-extrabold uppercase">Aktif</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-extrabold">32 peserta</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs">
                  <HiOutlineCheck />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">JavaScript Dasar</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-3">WD-02 · 14 pertemuan</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-md text-[9px] font-extrabold uppercase">Aktif</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-extrabold">28 peserta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level 2 - Intermediate */}
          <div className="relative mb-16">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white px-4 py-1 text-[10px] font-extrabold text-amber-600 uppercase tracking-widest border border-amber-100 rounded-full shadow-sm flex items-center gap-1">
                🚀 Level 2 — Intermediate
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 relative z-10">
              {/* Card 3 */}
              <div className="bg-amber-50/50 rounded-2xl border-2 border-amber-400 p-6 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">
                  <HiOutlineClock />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-1">React JS Fundamental</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-1">WD-03 · 14 pertemuan</p>
                <p className="text-[9px] text-amber-600 font-bold mb-3">Syarat: WD-01 + WD-02</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[9px] font-extrabold uppercase">Draft</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 shadow-sm relative group hover:-translate-y-1 transition-all duration-300">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs">
                  <HiOutlinePlus />
                </div>
                <h3 className="text-sm font-extrabold text-gray-500 mb-1">Node.js & API</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-1">WD-04 · Belum dibuat</p>
                <p className="text-[9px] text-gray-400 font-bold mb-3">Syarat: WD-03</p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[9px] font-extrabold uppercase">Belum Dibuat</span>
                </div>
              </div>
            </div>
          </div>

          {/* Level 3 - Advanced */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-white px-4 py-1 text-[10px] font-extrabold text-red-600 uppercase tracking-widest border border-red-100 rounded-full shadow-sm flex items-center gap-1">
                🏆 Level 3 — Advanced
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
            
            <div className="flex justify-center mt-12 relative z-10">
              {/* Card 5 */}
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-6 shadow-sm w-full md:w-1/2 relative group hover:-translate-y-1 transition-all duration-300 text-center">
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs">
                  <HiOutlineLockClosed />
                </div>
                <h3 className="text-sm font-extrabold text-gray-500 mb-1">Full Stack Project</h3>
                <p className="text-[10px] text-gray-400 font-bold mb-1">WD-05 · Capstone</p>
                <p className="text-[9px] text-gray-400 font-bold mb-3">Syarat: WD-01 s/d WD-04 selesai</p>
                <div className="flex gap-2 justify-center">
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded-md text-[9px] font-extrabold uppercase">Belum Dibuat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Inputs & Stats */}
        <div className="xl:col-span-3 space-y-8">
          {/* Input Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-6">Input Node Kursus</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nama Kursus</label>
                <input 
                  type="text" 
                  placeholder="Nama kursus baru.." 
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Level</label>
                <div className="flex flex-wrap gap-3">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="radio" 
                        name="level" 
                        value={level}
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-medium text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Sambungkan dari Kursus</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-500">
                  <option>Pilih prasyarat kursus</option>
                  <option>WD-01 - HTML & CSS</option>
                  <option>WD-02 - JavaScript</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Arah ke Kursus Berikutnya</label>
                <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-500">
                  <option>Pilih kursus lanjutan</option>
                  <option>WD-03 - React JS</option>
                  <option>WD-04 - Node.js</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Warna Label</label>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 cursor-pointer border-2 border-white ring-2 ring-indigo-500"></div>
                  <div className="w-5 h-5 rounded-full bg-purple-600 cursor-pointer"></div>
                  <div className="w-5 h-5 rounded-full bg-amber-500 cursor-pointer"></div>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 cursor-pointer"></div>
                </div>
              </div>

              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-2">
                Simpan Node ke Map
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-6">Statistik Course Map</h2>
            
            <div className="space-y-3">
              {[
                { label: 'Total Kursus di Map', value: 5, color: 'text-gray-900' },
                { label: 'Sudah Aktif', value: 2, color: 'text-emerald-600' },
                { label: 'Draft/Proses', value: 2, color: 'text-amber-600' },
                { label: 'Belum Dibuat', value: 1, color: 'text-gray-400' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-medium text-gray-500">{stat.label}</span>
                  <span className={`text-sm font-extrabold ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMap;

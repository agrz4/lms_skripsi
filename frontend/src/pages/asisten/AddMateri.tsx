import React, { useState } from 'react';
import { 
  HiOutlineCloudArrowUp, 
  HiOutlineVideoCamera, 
  HiOutlineDocumentText, 
  HiOutlineLink,
  HiOutlinePlus,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineInformationCircle
} from 'react-icons/hi2';

const AddMateri: React.FC = () => {
  const [jenisMateri, setJenisMateri] = useState<'online' | 'micro' | 'general'>('micro');

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">ADD Materi</h1>
        <p className="text-gray-500 text-sm">Upload materi pembelajaran (nama materi given dari admin)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Upload Materi</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Nama Materi (given dari admin)</label>
                <input 
                  type="text" 
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  placeholder="Masukkan nama materi..."
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Jenis Materi</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="jenis" 
                      checked={jenisMateri === 'online'} 
                      onChange={() => setJenisMateri('online')}
                      className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${jenisMateri === 'online' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className={`text-sm font-bold ${jenisMateri === 'online' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>Online Meeting</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="jenis" 
                      checked={jenisMateri === 'micro'} 
                      onChange={() => setJenisMateri('micro')}
                      className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${jenisMateri === 'micro' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className={`text-sm font-bold ${jenisMateri === 'micro' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>Micro Learning</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="jenis" 
                      checked={jenisMateri === 'general'} 
                      onChange={() => setJenisMateri('general')}
                      className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${jenisMateri === 'general' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-200'}`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className={`text-sm font-bold ${jenisMateri === 'general' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>General</span>
                  </label>
                </div>
              </div>

              {/* Conditional Sections */}
              {jenisMateri === 'online' && (
                <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-6 bg-gray-50/30">
                   <p className="text-[10px] font-bold text-gray-400 uppercase italic">Jika Online Meeting:</p>
                   <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Link Zoom Meeting</label>
                    <input type="text" className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs" placeholder="https://zoom.us/j/..." />
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Upload Rekaman Zoom</label>
                    <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer">
                      <HiOutlineCloudArrowUp className="text-3xl text-gray-300" />
                      <span className="text-xs text-gray-400 font-medium">Upload rekaman (.mp4)</span>
                    </div>
                   </div>
                </div>
              )}

              {jenisMateri === 'micro' && (
                <div className="p-6 border-2 border-dashed border-emerald-100 rounded-[2rem] space-y-6 bg-emerald-50/30">
                   <p className="text-[10px] font-bold text-emerald-600 uppercase italic">Micro Learning (aktif):</p>
                   <div>
                    <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-2">Link TikTok / Short</label>
                    <input type="text" className="w-full p-3 bg-white border border-emerald-100 rounded-xl text-xs text-emerald-700 placeholder-emerald-300" placeholder="https://tiktok.com/..." />
                   </div>
                   <div>
                    <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-2">Upload Video Lokal</label>
                    <div className="w-full p-8 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-white transition-all cursor-pointer bg-white/50 shadow-inner">
                      <HiOutlineVideoCamera className="text-3xl text-emerald-500" />
                      <div className="text-center">
                        <span className="text-xs text-emerald-600 font-bold block">Upload video lokal</span>
                        <span className="text-[9px] text-emerald-400 uppercase">(.mp4 maks 500MB)</span>
                      </div>
                    </div>
                   </div>
                </div>
              )}

              {jenisMateri === 'general' && (
                <div className="p-6 border-2 border-dashed border-gray-100 rounded-[2rem] space-y-6 bg-gray-50/30">
                   <p className="text-[10px] font-bold text-gray-400 uppercase italic">Jika General PDF:</p>
                   <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Upload Material (PDF)</label>
                    <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all cursor-pointer">
                      <HiOutlineDocumentText className="text-3xl text-gray-300" />
                      <span className="text-xs text-gray-400 font-medium">Upload file PDF</span>
                    </div>
                   </div>
                </div>
              )}

              {/* AI Notification */}
              <div className="mt-10 p-5 bg-slate-800 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 text-xl flex-shrink-0">
                    <HiOutlineSparkles />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Notifikasi AI</p>
                    <p className="text-white text-[11px] leading-relaxed opacity-80 font-medium">
                      Setelah materi disimpan, AI akan otomatis memproses konten <span className="text-emerald-400 font-bold">(Transcript → RAG → SLM)</span> untuk generate soal ujian dan refleks.
                    </p>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Secondary Forms & Status */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Refleksi & Tugas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Upload Refleksi Materi (Essai)</label>
                <div className="w-full min-h-[200px] border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/30 flex items-center justify-center p-6 text-center">
                   <p className="text-xs text-gray-400 italic leading-relaxed">Berikan deskripsi atau upload file untuk bahan refleksi mahasiswa...</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Upload Tugas 10 PG (Opsional)</label>
                <div className="space-y-3 mb-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl group hover:border-emerald-200 transition-all">
                      <span className="text-xs font-bold text-gray-600">Soal {i} — {i === 1 ? 'Neural Network?' : 'Fungsi aktivasi?'}</span>
                      <HiOutlineCheckCircle className="text-emerald-500 text-xl" />
                    </div>
                  ))}
                  <p className="text-[9px] text-gray-400 text-center italic">hingga 10 soal</p>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
                    <HiOutlinePlus className="text-lg" /> Tambah Soal
                  </button>
                  <button className="flex-1 py-3 bg-orange-100 text-orange-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-200 transition-all">
                    Import File
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Status Upload</h2>
            
            <div className="space-y-4 mb-8">
              {[
                { label: 'Video Lokal', status: 'Uploaded', color: 'bg-emerald-100 text-emerald-600' },
                { label: 'Link TikTok', status: 'Valid', color: 'bg-emerald-100 text-emerald-600' },
                { label: 'Refleksi', status: 'Draft', color: 'bg-orange-100 text-orange-600' },
                { label: 'Soal Tugas (10 PG)', status: '2 / 10', color: 'bg-orange-100 text-orange-600' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <span className="text-sm font-bold text-gray-700">{item.label}</span>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl mb-8 flex gap-3">
              <HiOutlineInformationCircle className="text-xl text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-800 font-medium leading-relaxed">
                Setelah simpan, AI akan memproses materi secara otomatis. Mohon tidak menutup halaman saat proses penyimpanan berlangsung.
              </p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-4 bg-orange-100 text-orange-700 rounded-2xl font-bold text-sm hover:bg-orange-200 transition-all shadow-sm">
                Simpan Draft
              </button>
              <button className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all">
                Simpan Materi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMateri;

import React, { useState } from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineChevronRight,
  HiOutlineInformationCircle
} from 'react-icons/hi2';

const UjianPage: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>('C');

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10">Ujian — Web Development (30 Soal)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2 mb-8">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button 
                    key={num}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                      num === 1 ? 'bg-red-500 text-white shadow-lg shadow-red-100' :
                      num === 2 ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' :
                      'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Salah</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Belum</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-2">Skor Sementara</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold text-emerald-400">3</span>
                <span className="text-sm opacity-40 font-bold">dari 100</span>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            </div>

            <button className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all">
              <HiOutlineSparkles /> AI menilai otomatis
            </button>
          </div>

          {/* Main Content - Questions */}
          <div className="lg:col-span-9 space-y-8">
            {/* Soal 1 - Salah */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Soal 1 dari 30</h2>
                  <p className="text-gray-700 font-medium leading-relaxed">Bahasa pemrograman yang digunakan untuk membuat website menjadi interaktif adalah...</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  Dijawab <HiOutlineCheckCircle />
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {[
                  { id: 'A', text: 'HTML' },
                  { id: 'B', text: 'CSS' },
                  { id: 'C', text: 'Java Script', isCorrect: true },
                  { id: 'D', text: 'Java', isUserChoice: true },
                ].map((opt) => (
                  <div 
                    key={opt.id}
                    className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      opt.isCorrect ? 'bg-emerald-50 border-emerald-500' :
                      opt.isUserChoice ? 'bg-red-50 border-red-500' :
                      'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        opt.isCorrect ? 'bg-emerald-500 text-white' :
                        opt.isUserChoice ? 'bg-red-500 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {opt.id}
                      </div>
                      <span className={`font-bold ${opt.isCorrect ? 'text-emerald-700' : opt.isUserChoice ? 'text-red-700' : 'text-gray-600'}`}>
                        {opt.text}
                      </span>
                    </div>
                    {opt.isCorrect && <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">← Benar</span>}
                    {opt.isUserChoice && <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">← Kamu</span>}
                  </div>
                ))}
              </div>

              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3">
                <HiOutlineXCircle className="text-2xl text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-800 font-medium leading-relaxed">
                  <span className="font-bold">AI:</span> Jawaban salah. Jawaban benar adalah <span className="font-bold underline">C — Java Script</span>. Java Script adalah bahasa scripting yang berjalan di browser untuk memanipulasi DOM. Materi ini dibahas di <span className="font-bold">Materi 1 sesi pembukaan</span>.
                </p>
              </div>
            </div>

            {/* Soal 2 - Aktif */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Soal 2 dari 30</h2>
                  <p className="text-gray-700 font-medium leading-relaxed">Fungsi utama CSS dalam web development adalah...</p>
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Dikerjakan
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-8">
                {[
                  { id: 'A', text: 'Mengatur logika program' },
                  { id: 'B', text: 'Mengelola database' },
                  { id: 'C', text: 'Mengatur tampilan halaman web' },
                  { id: 'D', text: 'Menghubungkan server' },
                ].map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => setSelectedAnswer(opt.id)}
                    className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${
                      selectedAnswer === opt.id ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-100 hover:border-purple-200'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      selectedAnswer === opt.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {opt.id}
                    </div>
                    <span className={`font-bold transition-colors ${selectedAnswer === opt.id ? 'text-purple-900' : 'text-gray-600'}`}>
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex gap-3 animate-pulse">
                <HiOutlineSparkles className="text-2xl text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-purple-800 font-medium leading-relaxed">
                  AI akan menilai otomatis setelah kamu submit jawaban ini...
                </p>
              </div>
            </div>

            {/* Reflection Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-10 rounded-[2.5rem] border border-emerald-200 shadow-sm">
               <h2 className="text-2xl font-extrabold text-emerald-900 mb-8 flex items-center gap-3">
                  Refleksi Materi — AI Generate <HiOutlineSparkles className="text-emerald-500" />
               </h2>
               <textarea 
                  className="w-full p-8 bg-white border border-emerald-200 rounded-[2rem] text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[200px] shadow-inner mb-6"
                  placeholder="Apa yang telah kamu pelajari? Ceritakan pemahamanmu tentang Web Development..."
               ></textarea>
               
               <div className="flex items-center gap-3 mb-8 text-emerald-800/60 p-4 bg-emerald-200/20 rounded-2xl border border-emerald-200/30">
                  <HiOutlineInformationCircle className="text-xl flex-shrink-0" />
                  <p className="text-[10px] font-medium leading-relaxed uppercase tracking-wider">
                    AI akan memberikan saran skor. Nilai akhir ditentukan oleh Asisten berdasarkan kualitas refleksi kamu.
                  </p>
               </div>

               <button className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-extrabold text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                  Kumpulkan Ujian <HiOutlineChevronRight />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UjianPage;

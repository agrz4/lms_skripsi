import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhoto,
  HiOutlineDocumentArrowDown,
  HiOutlineCheckCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineInformationCircle
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const KoreksiUploadDetail: React.FC = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState<number>(82);

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setScore(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
  };

  const checklistItems = [
    "Struktur HTML benar (head, body)",
    "Ada heading, paragraf, list",
    "Link dan gambar berfungsi",
    "Kode bersih & terstruktur"
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header Navigation */}
      <div className="flex items-center gap-6 mb-10">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="bg-white border-none shadow-sm rounded-xl font-bold text-[10px] uppercase py-6 px-6"
        >
          <HiOutlineArrowLeft className="mr-2" /> Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
             Koreksi Upload — <span className="text-indigo-600">Ani Susanti</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
             Web Dev Bootcamp · P2 HTML Dasar · Upload Screenshot Coding
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Files & Instructions */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8">File yang Di-upload Peserta</h2>
            
            <div className="bg-gray-50 rounded-[2rem] p-8 space-y-8 border border-gray-100">
              {/* Screenshots Group */}
              <div className="space-y-4">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-amber-400 rounded-sm"></div>
                    <h3 className="text-sm font-black text-gray-700">Screenshot Coding (2 file)</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="aspect-[4/3] bg-indigo-100/50 rounded-2xl border-2 border-indigo-50 flex flex-col items-center justify-center gap-3 relative group overflow-hidden">
                       <HiOutlinePhoto className="text-4xl text-indigo-300" />
                       <span className="text-[10px] font-bold text-indigo-400">screenshot_1.png</span>
                       <Button size="sm" className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[8px] px-4 py-0 h-6 rounded-lg">LIHAT</Button>
                    </div>
                    <div className="aspect-[4/3] bg-indigo-100/50 rounded-2xl border-2 border-indigo-50 flex flex-col items-center justify-center gap-3 relative group overflow-hidden">
                       <HiOutlinePhoto className="text-4xl text-indigo-300" />
                       <span className="text-[10px] font-bold text-indigo-400">screenshot_2.png</span>
                       <Button size="sm" className="absolute top-4 right-4 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[8px] px-4 py-0 h-6 rounded-lg">LIHAT</Button>
                    </div>
                 </div>
              </div>

              {/* Zip File */}
              <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                       <HiOutlineDocumentArrowDown className="text-2xl" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-indigo-900">program_html.zip</p>
                       <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">2.4 MB · Submitted 10:30</p>
                    </div>
                 </div>
                 <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] px-6 rounded-xl">DOWNLOAD</Button>
              </div>
            </div>
          </Card>

          {/* Task Description */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-xl font-black text-gray-900 mb-6">Deskripsi Latihan</h2>
             <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-medium text-gray-500 leading-relaxed">
                Buat halaman HTML sederhana dengan struktur yang benar: heading, paragraf, list, link, dan gambar. Screenshot hasil browser dan upload file zip projectnya.
             </div>
          </Card>
        </div>

        {/* Right Section: Form Koreksi Upload */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden sticky top-10">
             <div className="p-8 pb-4">
                <h2 className="text-xl font-black text-gray-900 mb-2">Form Koreksi Upload</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Peserta</label>
                   <Input disabled value="Ani Susanti - E173038" className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Jenis Latihan</label>
                   <Input disabled value="Screenshot Coding + Upload File" className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                {/* Checklist Section */}
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Checklist Penilaian</label>
                   <div className="p-6 bg-gray-50 rounded-[1.8rem] space-y-4 border border-gray-100">
                      {checklistItems.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                           <Checkbox id={`item-${idx}`} className="w-5 h-5 rounded-md border-gray-300 data-[state=checked]:bg-indigo-600" />
                           <label htmlFor={`item-${idx}`} className="text-[10px] font-bold text-gray-500 leading-tight cursor-pointer">
                              {item}
                           </label>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Score Section */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center">Input Nilai (0-100)</label>
                   <div className="relative group">
                      <div className="h-40 border-4 border-[#10B981] rounded-[2.5rem] flex items-center justify-center bg-white shadow-xl shadow-emerald-50">
                         <input 
                           type="number"
                           min="0"
                           max="100"
                           value={score === 0 ? '' : score}
                           onChange={handleScoreChange}
                           className="text-6xl font-black text-gray-900 w-full text-center focus:outline-none bg-transparent"
                         />
                      </div>
                      <div className="absolute -bottom-2 left-10 right-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-[#10B981] transition-all duration-500" style={{ width: `${score}%` }}></div>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Catatan Feedback</label>
                   <textarea className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium focus:ring-4 focus:ring-indigo-100 transition-all h-32" placeholder="Berikan feedback untuk praktik mahasiswa..."></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                   <Button 
                     variant="outline" 
                     onClick={() => navigate(-1)}
                     className="flex-1 py-7 rounded-2xl font-black text-xs border-none bg-gray-100 text-gray-400"
                   >
                     BATAL
                   </Button>
                   <Button className="flex-1 py-7 rounded-2xl font-black text-xs bg-[#0E341E] hover:bg-[#0a2616] text-white shadow-xl shadow-emerald-100">
                      <HiOutlineClipboardDocumentList className="mr-2 text-lg" /> SIMPAN KOREKSI
                   </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KoreksiUploadDetail;

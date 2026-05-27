import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { 
  HiOutlinePlus, 
  HiOutlineCheck, 
  HiOutlineClock,
  HiOutlineLockClosed
} from 'react-icons/hi2';

const CourseMap: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, isLoading, fetchMataKuliah, updateMataKuliah } = useMataKuliahStore();

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Beginner');
  const [warna, setWarna] = useState<string>('blue');
  const [prerequisiteId, setPrerequisiteId] = useState<string>('');
  const [nextCourseId, setNextCourseId] = useState<string>('');

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  const handleCourseSelect = (id: string) => {
    setSelectedCourseId(id);
    const course = mataKuliahList.find(mk => mk.id === id);
    if (course) {
      setSelectedLevel(course.level || 'Beginner');
      setWarna(course.warna || 'blue');
      
      // Load first prerequisite if any
      const firstPrereq = course.prerequisites?.[0];
      setPrerequisiteId(firstPrereq ? (typeof firstPrereq === 'object' ? firstPrereq.id : firstPrereq) : '');

      // Load next course (find one where this course is its prerequisite)
      const nextC = mataKuliahList.find(mk => 
        mk.prerequisites?.some(p => (typeof p === 'object' ? p.id : p) === id)
      );
      setNextCourseId(nextC ? nextC.id : '');
    } else {
      setSelectedLevel('Beginner');
      setWarna('blue');
      setPrerequisiteId('');
      setNextCourseId('');
    }
  };

  const handleSaveNode = async () => {
    if (!selectedCourseId) {
      alert('Pilih kursus yang ingin dikonfigurasi terlebih dahulu.');
      return;
    }

    try {
      // 1. Update this course's level, warna, and prerequisites
      const prerequisites = prerequisiteId ? [prerequisiteId] : [];
      await updateMataKuliah(selectedCourseId, {
        level: selectedLevel,
        warna,
        prerequisites
      });

      // 2. Update next course's prerequisites if selected
      if (nextCourseId) {
        const nextCourse = mataKuliahList.find(mk => mk.id === nextCourseId);
        if (nextCourse) {
          const currentPrereqs = nextCourse.prerequisites?.map(p => typeof p === 'object' ? p.id : p) || [];
          if (!currentPrereqs.includes(selectedCourseId)) {
            await updateMataKuliah(nextCourseId, {
              prerequisites: [...currentPrereqs, selectedCourseId]
            });
          }
        }
      }

      alert('Node peta kursus berhasil disimpan!');
      // Refetch from backend to refresh map
      await fetchMataKuliah();
    } catch (error) {
      console.error('Error saving course node:', error);
      alert('Gagal menyimpan konfigurasi node.');
    }
  };

  // Helper mapping colors
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'purple':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-50/20',
          text: 'text-purple-600',
          shadow: 'shadow-purple-50',
          badge: 'bg-purple-100 text-purple-600',
          dot: 'bg-purple-600'
        };
      case 'amber':
        return {
          border: 'border-amber-400',
          bg: 'bg-amber-50/50',
          text: 'text-amber-600',
          shadow: 'shadow-amber-50',
          badge: 'bg-amber-100 text-amber-600',
          dot: 'bg-amber-500'
        };
      case 'emerald':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-50/20',
          text: 'text-emerald-600',
          shadow: 'shadow-emerald-50',
          badge: 'bg-emerald-100 text-emerald-600',
          dot: 'bg-emerald-500'
        };
      case 'blue':
      default:
        return {
          border: 'border-indigo-600',
          bg: 'bg-white',
          text: 'text-indigo-600',
          shadow: 'shadow-indigo-50',
          badge: 'bg-indigo-100 text-indigo-600',
          dot: 'bg-blue-600'
        };
    }
  };

  // Filter courses by level
  const getCoursesByLevel = (level: string) => {
    return mataKuliahList.filter(mk => {
      const currentLevel = mk.level || (mk.kode.startsWith('IF') ? 'Beginner' : 'Intermediate');
      return currentLevel.toLowerCase() === level.toLowerCase();
    });
  };

  const beginnerCourses = getCoursesByLevel('Beginner');
  const intermediateCourses = getCoursesByLevel('Intermediate');
  const advancedCourses = getCoursesByLevel('Advanced');

  // Stats calculation
  const totalCourses = mataKuliahList.length;
  const activeCourses = mataKuliahList.filter(mk => mk.published).length;
  const draftCourses = mataKuliahList.filter(mk => !mk.published).length;

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
            <button 
              onClick={() => navigate('/admin/buat-kursus')} 
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <HiOutlinePlus className="text-sm" /> Tambah Node
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Peta Kurikulum...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Level 1 - Beginner */}
              <div>
                <div className="relative h-10 flex items-center justify-center">
                  <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
                  <span className="relative z-10 bg-white px-4 py-1 text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest border border-indigo-100 rounded-full shadow-sm flex items-center gap-1">
                    🎯 Level 1 — Beginner
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 mb-12">
                  {beginnerCourses.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-xs text-gray-400 italic font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      Belum ada kursus di level ini
                    </div>
                  ) : (
                    beginnerCourses.map(course => {
                      const colors = getColorClasses(course.warna);
                      const isSelected = selectedCourseId === course.id;
                      const prereqsText = course.prerequisites && course.prerequisites.length > 0 
                        ? `Syarat: ${course.prerequisites.map((p: any) => p.kode || p.nama || p).join(', ')}`
                        : '';
                        
                      return (
                        <div 
                          key={course.id}
                          onClick={() => handleCourseSelect(course.id)}
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 relative group ${colors.border} ${colors.bg} ${colors.shadow} ${
                            isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-md'
                          }`}
                        >
                          <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            course.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            {course.published ? <HiOutlineCheck /> : <HiOutlineClock />}
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-900 mb-1">{course.nama}</h3>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">{course.kode} · {course.pertemuan?.length || 14} pertemuan</p>
                          {prereqsText && <p className="text-[9px] text-amber-600 font-bold mb-1">{prereqsText}</p>}
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                              course.published ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {course.published ? 'Aktif' : 'Draft'}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-extrabold">
                              {course._count?.pendaftaran || 0} peserta
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Level 2 - Intermediate */}
              <div>
                <div className="relative h-10 flex items-center justify-center">
                  <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
                  <span className="relative z-10 bg-white px-4 py-1 text-[10px] font-extrabold text-amber-600 uppercase tracking-widest border border-amber-100 rounded-full shadow-sm flex items-center gap-1">
                    🚀 Level 2 — Intermediate
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 mb-12">
                  {intermediateCourses.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-xs text-gray-400 italic font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      Belum ada kursus di level ini
                    </div>
                  ) : (
                    intermediateCourses.map(course => {
                      const colors = getColorClasses(course.warna);
                      const isSelected = selectedCourseId === course.id;
                      const prereqsText = course.prerequisites && course.prerequisites.length > 0 
                        ? `Syarat: ${course.prerequisites.map((p: any) => p.kode || p.nama || p).join(', ')}`
                        : '';
                        
                      return (
                        <div 
                          key={course.id}
                          onClick={() => handleCourseSelect(course.id)}
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 relative group ${colors.border} ${colors.bg} ${colors.shadow} ${
                            isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-md'
                          }`}
                        >
                          <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            course.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            {course.published ? <HiOutlineCheck /> : <HiOutlineClock />}
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-900 mb-1">{course.nama}</h3>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">{course.kode} · {course.pertemuan?.length || 14} pertemuan</p>
                          {prereqsText && <p className="text-[9px] text-amber-600 font-bold mb-1">{prereqsText}</p>}
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                              course.published ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {course.published ? 'Aktif' : 'Draft'}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-extrabold">
                              {course._count?.pendaftaran || 0} peserta
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Level 3 - Advanced */}
              <div>
                <div className="relative h-10 flex items-center justify-center">
                  <div className="border-t border-dashed border-gray-200 w-full absolute top-1/2 -translate-y-1/2"></div>
                  <span className="relative z-10 bg-white px-4 py-1 text-[10px] font-extrabold text-red-600 uppercase tracking-widest border border-red-100 rounded-full shadow-sm flex items-center gap-1">
                    🏆 Level 3 — Advanced
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                  {advancedCourses.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-xs text-gray-400 italic font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      Belum ada kursus di level ini
                    </div>
                  ) : (
                    advancedCourses.map(course => {
                      const colors = getColorClasses(course.warna);
                      const isSelected = selectedCourseId === course.id;
                      const prereqsText = course.prerequisites && course.prerequisites.length > 0 
                        ? `Syarat: ${course.prerequisites.map((p: any) => p.kode || p.nama || p).join(', ')}`
                        : '';
                        
                      return (
                        <div 
                          key={course.id}
                          onClick={() => handleCourseSelect(course.id)}
                          className={`cursor-pointer rounded-2xl border-2 p-6 transition-all duration-300 relative group ${colors.border} ${colors.bg} ${colors.shadow} ${
                            isSelected ? 'ring-2 ring-indigo-500 scale-[1.02]' : 'hover:-translate-y-1 hover:shadow-md'
                          }`}
                        >
                          <div className={`absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                            course.published ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}>
                            {course.published ? <HiOutlineCheck /> : <HiOutlineClock />}
                          </div>
                          <h3 className="text-sm font-extrabold text-gray-900 mb-1">{course.nama}</h3>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">{course.kode} · {course.pertemuan?.length || 14} pertemuan</p>
                          {prereqsText && <p className="text-[9px] text-amber-600 font-bold mb-1">{prereqsText}</p>}
                          <div className="flex gap-2 mt-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                              course.published ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                              {course.published ? 'Aktif' : 'Draft'}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[9px] font-extrabold">
                              {course._count?.pendaftaran || 0} peserta
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Inputs & Stats */}
        <div className="xl:col-span-3 space-y-8">
          {/* Input Form */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-6">Kelola Node Kursus</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Pilih Kursus</label>
                <select 
                  value={selectedCourseId}
                  onChange={(e) => handleCourseSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 font-medium"
                >
                  <option value="">-- Pilih Kursus --</option>
                  {mataKuliahList.map(mk => (
                    <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                  ))}
                </select>
              </div>

              {selectedCourseId && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Level</label>
                    <div className="flex flex-wrap gap-3">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <label key={lvl} className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="radio" 
                            name="level" 
                            value={lvl}
                            checked={selectedLevel === lvl}
                            onChange={() => setSelectedLevel(lvl)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-medium text-gray-700">{lvl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Sambungkan dari Kursus (Prasyarat)</label>
                    <select 
                      value={prerequisiteId}
                      onChange={(e) => setPrerequisiteId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 font-medium"
                    >
                      <option value="">Pilih prasyarat kursus</option>
                      {mataKuliahList
                        .filter(mk => mk.id !== selectedCourseId)
                        .map(mk => (
                          <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Arah ke Kursus Berikutnya (Lanjutan)</label>
                    <select 
                      value={nextCourseId}
                      onChange={(e) => setNextCourseId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-700 font-medium"
                    >
                      <option value="">Pilih kursus lanjutan</option>
                      {mataKuliahList
                        .filter(mk => mk.id !== selectedCourseId && mk.id !== prerequisiteId)
                        .map(mk => (
                          <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Warna Label</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'blue', class: 'bg-blue-600' },
                        { id: 'purple', class: 'bg-purple-600' },
                        { id: 'amber', class: 'bg-amber-500' },
                        { id: 'emerald', class: 'bg-emerald-500' }
                      ].map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setWarna(c.id)}
                          className={`w-5 h-5 rounded-full ${c.class} cursor-pointer border-2 transition-all ${
                            warna === c.id 
                              ? 'border-white ring-2 ring-indigo-500 scale-110' 
                              : 'border-transparent hover:scale-105'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveNode}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all mt-2"
                  >
                    Simpan Node ke Map
                  </button>
                </>
              )}

              {!selectedCourseId && (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  Pilih salah satu kursus di map atau dari dropdown untuk mulai mengatur alur.
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-6">Statistik Course Map</h2>
            
            <div className="space-y-3">
              {[
                { label: 'Total Kursus di Map', value: totalCourses, color: 'text-gray-900' },
                { label: 'Sudah Aktif', value: activeCourses, color: 'text-emerald-600' },
                { label: 'Draft/Proses', value: draftCourses, color: 'text-amber-600' },
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

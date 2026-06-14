import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { 
  HiOutlineCheck, 
  HiOutlineClock
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";

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

  // Helper matching the 5 structured courses in the mockup diagram
  const getNodeState = (code: string, defaultName: string, defaultLevel: string, fallbackParticipants: number, fallbackJadwal: string, fallbackPrereqs: string) => {
    // Try to find course in database that matches this code or name
    const dbCourse = mataKuliahList.find(mk => mk.kode === code || mk.nama.toLowerCase().includes(defaultName.toLowerCase()));
    
    if (dbCourse) {
      return {
        id: dbCourse.id,
        nama: dbCourse.nama,
        kode: dbCourse.kode,
        level: dbCourse.level || defaultLevel,
        published: dbCourse.published,
        participants: dbCourse._count?.pendaftaran || 0,
        jadwalText: `${dbCourse._count?.pertemuan || 14} pertemuan`,
        prereqText: dbCourse.prerequisites && dbCourse.prerequisites.length > 0 
          ? `Syarat: ${dbCourse.prerequisites.map((p: any) => p.kode || p.nama || p).join(', ')}`
          : '',
        exists: true
      };
    }

    // Fallback Mock Data directly matching the screenshot
    return {
      id: '',
      nama: defaultName,
      kode: code,
      level: defaultLevel,
      published: code === 'WD-01' || code === 'WD-02', // WD-01 & WD-02 are active in screenshot
      participants: fallbackParticipants,
      jadwalText: fallbackJadwal,
      prereqText: fallbackPrereqs ? `Syarat: ${fallbackPrereqs}` : '',
      exists: false
    };
  };

  const node1 = getNodeState('WD-01', 'HTML & CSS Dasar', 'Beginner', 32, '14 pertemuan', '');
  const node2 = getNodeState('WD-02', 'JavaScript Dasar', 'Beginner', 28, '14 pertemuan', '');
  const node3 = getNodeState('WD-03', 'React JS Fundamental', 'Intermediate', 0, '14 pertemuan', 'WD-01+02');
  const node4 = getNodeState('WD-04', 'Node.js & API', 'Intermediate', 0, 'Belum dibuat', 'WD-03');
  const node5 = getNodeState('WD-05', 'Full Stack Project', 'Advanced', 0, 'Capstone', 'WD-01+04 selesai');

  // Dynamic check: if database has courses, we render DB courses dynamically
  // If the database has no courses at all, we fall back to mockup courses
  const hasDbCourses = mataKuliahList.length > 0;

  // Group real courses by level
  const beginnerCourses = mataKuliahList.filter(mk => (mk.level || 'Beginner').toLowerCase() === 'beginner');
  const intermediateCourses = mataKuliahList.filter(mk => (mk.level || '').toLowerCase() === 'intermediate');
  const advancedCourses = mataKuliahList.filter(mk => (mk.level || '').toLowerCase() === 'advanced' || (mk.level || '').toLowerCase() === 'advance');

  // Stats calculation
  const totalCourses = hasDbCourses ? mataKuliahList.length : 5;
  const activeCount = hasDbCourses 
    ? mataKuliahList.filter(mk => mk.published).length 
    : [node1, node2, node3, node4, node5].filter(n => n.published).length;
  const draftCount = hasDbCourses 
    ? mataKuliahList.filter(mk => !mk.published).length 
    : [node1, node2, node3, node4, node5].filter(n => !n.published && n.exists).length;
  const notCreatedCount = hasDbCourses 
    ? Math.max(0, 5 - mataKuliahList.length) 
    : [node1, node2, node3, node4, node5].filter(n => !n.exists).length;

  const handleNodeClick = (node: any) => {
    if (node.exists && node.id) {
      handleCourseSelect(node.id);
    } else {
      alert(`Kursus "${node.nama}" (${node.kode}) belum dibuat di database. Silakan tambahkan terlebih dahulu di Menu Kursus.`);
    }
  };

  const getCardStyles = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl === 'beginner') {
      return {
        bg: 'bg-[#adcbe3]',
        border: 'border-[#5850ec]',
      };
    } else if (lvl === 'intermediate') {
      return {
        bg: 'bg-[#dce3a4]',
        border: 'border-yellow-500',
      };
    } else {
      return {
        bg: 'bg-[#d7d8dc]',
        border: 'border-gray-400',
      };
    }
  };

  const renderDynamicCourseCard = (course: MataKuliah) => {
    const isSelected = selectedCourseId === course.id;
    const levelStr = course.level || 'Beginner';
    const styles = getCardStyles(levelStr);
    const isPublished = course.published;
    const participants = course._count?.pendaftaran || 0;
    
    const prereqsText = course.prerequisites && course.prerequisites.length > 0 
      ? `Syarat: ${course.prerequisites.map((p: any) => p.kode || p.nama || p).join(', ')}`
      : '';

    return (
      <div 
        key={course.id}
        onClick={() => handleCourseSelect(course.id)}
        className={`cursor-pointer rounded-[1.5rem] border-2 p-5 relative transition-all hover:scale-102 w-[280px] text-left ${styles.bg} ${styles.border} ${
          isSelected ? 'ring-2 ring-indigo-500/20 scale-[1.02]' : ''
        }`}
      >
        {isPublished ? (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">✓</div>
        ) : (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#eab308] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">⏳</div>
        )}
        <h3 className="text-xs font-bold text-gray-900 mb-0.5 truncate">{course.nama}</h3>
        <p className="text-[9px] text-gray-500 font-bold mb-3">{course.kode} · {course._count?.pertemuan || 14} pertemuan</p>
        <div className="flex flex-wrap gap-2">
          {isPublished ? (
            <span className="bg-[#5850ec] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold">
              Aktif
            </span>
          ) : (
            <span className="bg-[#feefe3] text-[#b06000] border border-[#feefe3] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
              Draft
            </span>
          )}
          <span className="bg-[#e6f4ea] text-[#137333] border border-[#e6f4ea] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
            {participants} peserta
          </span>
          {prereqsText && (
            <span className="bg-white text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold truncate max-w-[150px]">
              {prereqsText}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Course Map — Web Development Path</h1>
        <p className="text-xs text-gray-500 font-medium">Atur urutan dan alur kursus · Sambungkan kursus dari level ke level berikutnya</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content - Flow Map */}
        <div className="xl:col-span-9 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-150">
          <div className="mb-10">
            <h2 className="text-sm font-black text-gray-900">Alur Kurikulum — Web Development</h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Peta Kurikulum...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Dynamic DB courses list if database has courses */}
              {hasDbCourses ? (
                <>
                  {/* Level 1 - Beginner */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#9cc3f8] text-[#5850ec] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-indigo-100 shadow-sm">
                        LEVEL 1 — BEGINNER
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {beginnerCourses.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 italic">Belum ada kursus di level ini</div>
                      ) : (
                        beginnerCourses.map((course, idx) => (
                          <React.Fragment key={course.id}>
                            {idx > 0 && <span className="text-gray-400 text-2xl font-light font-mono shrink-0">→</span>}
                            {renderDynamicCourseCard(course)}
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Arrow Between Level 1 and 2 */}
                  {beginnerCourses.length > 0 && intermediateCourses.length > 0 && (
                    <div className="flex justify-center shrink-0">
                      <span className="text-gray-400 text-2xl font-light font-mono">↓</span>
                    </div>
                  )}

                  {/* Level 2 - Intermediate */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#feefe3] text-[#b06000] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-[#feefe3] shadow-sm">
                        LEVEL 2 — INTERMEDIATE
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {intermediateCourses.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 italic">Belum ada kursus di level ini</div>
                      ) : (
                        intermediateCourses.map((course, idx) => (
                          <React.Fragment key={course.id}>
                            {idx > 0 && <span className="text-gray-400 text-2xl font-light font-mono shrink-0">→</span>}
                            {renderDynamicCourseCard(course)}
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Arrow Between Level 2 and 3 */}
                  {intermediateCourses.length > 0 && advancedCourses.length > 0 && (
                    <div className="flex justify-center shrink-0">
                      <span className="text-gray-400 text-2xl font-light font-mono">↓</span>
                    </div>
                  )}

                  {/* Level 3 - Advanced */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#e6f4ea] text-[#137333] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-[#e6f4ea] shadow-sm">
                        LEVEL 3 — ADVANCED
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-6">
                      {advancedCourses.length === 0 ? (
                        <div className="text-center py-6 text-xs text-gray-400 italic">Belum ada kursus di level ini</div>
                      ) : (
                        advancedCourses.map((course, idx) => (
                          <React.Fragment key={course.id}>
                            {idx > 0 && <span className="text-gray-400 text-2xl font-light font-mono shrink-0">→</span>}
                            {renderDynamicCourseCard(course)}
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback layout representing mockup courses exactly if DB is empty */
                <>
                  {/* Level 1 - Beginner */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#9cc3f8] text-[#5850ec] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-indigo-100 shadow-sm">
                        LEVEL 1 — BEGINNER
                      </span>
                    </div>

                    <div className="grid grid-cols-11 gap-4 items-center">
                      <div 
                        onClick={() => handleNodeClick(node1)}
                        className="col-span-5 cursor-pointer rounded-[1.5rem] border-2 p-5 relative bg-[#adcbe3] border-[#5850ec]"
                      >
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">✓</div>
                        <h3 className="text-xs font-bold text-gray-900 mb-0.5">{node1.nama}</h3>
                        <p className="text-[9px] text-gray-500 font-bold mb-3">{node1.kode} · {node1.jadwalText}</p>
                        <div className="flex gap-2">
                          <span className="bg-[#5850ec] text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            Aktif
                          </span>
                          <span className="bg-[#e6f4ea] text-[#137333] border border-[#e6f4ea] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            {node1.participants} peserta
                          </span>
                        </div>
                      </div>

                      <div className="col-span-1 flex flex-col items-center justify-center shrink-0">
                        <span className="text-gray-400 text-2xl font-light font-mono leading-none">→</span>
                        <span className="text-gray-400 text-2xl font-light font-mono leading-none mt-1.5">↓</span>
                      </div>

                      <div 
                        onClick={() => handleNodeClick(node2)}
                        className="col-span-5 cursor-pointer rounded-[1.5rem] border-2 p-5 relative bg-[#f5f7ff] border-[#5850ec]/40"
                      >
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">✓</div>
                        <h3 className="text-xs font-bold text-gray-900 mb-0.5">{node2.nama}</h3>
                        <p className="text-[9px] text-gray-500 font-bold mb-3">{node2.kode} · {node2.jadwalText}</p>
                        <div className="flex gap-2">
                          <span className="text-[#0fc26a] px-1 py-0.5 text-[9px] font-bold">
                            Aktif
                          </span>
                          <span className="bg-[#e6f4ea] text-[#137333] border border-[#e6f4ea] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            {node2.participants} peserta
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level 2 - Intermediate */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#feefe3] text-[#b06000] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-[#feefe3] shadow-sm">
                        LEVEL 2 — INTERMEDIATE
                      </span>
                    </div>

                    <div className="grid grid-cols-11 gap-4 items-center">
                      <div 
                        onClick={() => handleNodeClick(node3)}
                        className="col-span-5 cursor-pointer rounded-[1.5rem] border-2 p-5 relative bg-[#dce3a4] border-yellow-500"
                      >
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#eab308] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">⏳</div>
                        <h3 className="text-xs font-bold text-gray-900 mb-0.5">{node3.nama}</h3>
                        <p className="text-[9px] text-gray-500 font-bold mb-3">{node3.kode} · {node3.jadwalText}</p>
                        <div className="flex gap-2">
                          <span className="bg-[#feefe3] text-[#b06000] border border-[#feefe3] px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            Draft
                          </span>
                          <span className="bg-white text-gray-500 border border-gray-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            Syarat: {node3.prereqText.replace('Syarat: ', '')}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-1 flex flex-col items-center justify-center shrink-0">
                        <span className="text-gray-400 text-2xl font-light font-mono leading-none">→</span>
                        <span className="text-gray-400 text-2xl font-light font-mono leading-none mt-1.5">↓</span>
                      </div>

                      <div 
                        onClick={() => handleNodeClick(node4)}
                        className="col-span-5 cursor-pointer rounded-[1.5rem] border-2 p-5 relative bg-[#e1e2e6] border-gray-300"
                      >
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">+</div>
                        <h3 className="text-xs font-bold text-gray-750 mb-0.5">{node4.nama}</h3>
                        <p className="text-[9px] text-gray-400 font-bold mb-3">{node4.kode} · {node4.jadwalText}</p>
                        <div className="flex gap-2">
                          <span className="bg-white text-gray-450 border border-gray-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            Syarat: {node4.prereqText.replace('Syarat: ', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Level 3 - Advanced */}
                  <div>
                    <div className="flex justify-center mb-6">
                      <span className="bg-[#e6f4ea] text-[#137333] font-black px-4 py-1.5 rounded-full text-[10px] tracking-wider uppercase border border-[#e6f4ea] shadow-sm">
                        LEVEL 3 — ADVANCED
                      </span>
                    </div>

                    <div className="flex justify-center">
                      <div 
                        onClick={() => handleNodeClick(node5)}
                        className="w-[360px] cursor-pointer rounded-[1.5rem] border-2 p-5 relative bg-[#d7d8dc] border-gray-300"
                      >
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm">+</div>
                        <h3 className="text-xs font-bold text-gray-700 text-center mb-0.5">{node5.nama}</h3>
                        <p className="text-[9px] text-gray-400 font-bold text-center mb-3">{node5.kode} · {node5.jadwalText}</p>
                        <div className="flex justify-center">
                          <span className="bg-white text-gray-450 border border-gray-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold">
                            Syarat: {node5.prereqText.replace('Syarat: ', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Inputs & Stats */}
        <div className="xl:col-span-3 space-y-8">
          {/* Input Form Card */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-150">
            <h2 className="text-sm font-black text-gray-900 mb-5">Input Node Kursus</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Nama Kursus</label>
                <select 
                  value={selectedCourseId}
                  onChange={(e) => handleCourseSelect(e.target.value)}
                  className="w-full px-4 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-750 font-semibold shadow-sm"
                >
                  <option value="">Nama Kursus Baru....</option>
                  {mataKuliahList.map(mk => (
                    <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                  ))}
                </select>
              </div>

              {selectedCourseId && (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-2">Level</label>
                    <div className="flex flex-wrap gap-3">
                      {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                        <label key={lvl} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-650">
                          <input 
                            type="radio" 
                            name="level" 
                            value={lvl}
                            checked={selectedLevel === lvl}
                            onChange={() => setSelectedLevel(lvl)}
                            className="w-4 h-4 text-[#5850ec] focus:ring-[#5850ec] border-gray-300"
                          />
                          <span>{lvl}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">Sambungkan dari Kursus</label>
                    <select 
                      value={prerequisiteId}
                      onChange={(e) => setPrerequisiteId(e.target.value)}
                      className="w-full px-4 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-750 font-semibold shadow-sm"
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
                    <label className="text-xs font-bold text-gray-500 block mb-1">Arah ke Kursus Berikutnya</label>
                    <select 
                      value={nextCourseId}
                      onChange={(e) => setNextCourseId(e.target.value)}
                      className="w-full px-4 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-750 font-semibold shadow-sm"
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

                  <Button 
                    onClick={handleSaveNode}
                    className="w-full h-10 bg-[#5850ec] hover:bg-[#4f46e5] text-white font-bold rounded-lg text-xs shadow-sm transition-all mt-4 border-none"
                  >
                    Simpan Node ke Map
                  </Button>
                </>
              )}

              {!selectedCourseId && (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  Pilih salah satu kursus di map atau dari dropdown untuk mulai mengatur alur.
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-150">
            <h2 className="text-sm font-black text-gray-900 mb-5">Statistik Course Map</h2>
            
            <div className="space-y-3">
              {[
                { label: 'Total Kursus di Map', value: totalCourses, color: 'text-gray-900' },
                { label: 'Sudah Aktif', value: activeCount, color: 'text-[#10b981]' },
                { label: 'Draft/Proses', value: draftCount, color: 'text-[#b06000]' },
                { label: 'Belum Dibuat', value: notCreatedCount, color: 'text-gray-500' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
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

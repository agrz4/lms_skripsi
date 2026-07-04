import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { 
  HiOutlineClock, 
  HiOutlineBookOpen, 
  HiOutlineUsers, 
  HiOutlineArrowRight, 
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineMagnifyingGlass as HiOutlineSearch,
  HiOutlineCheck
} from 'react-icons/hi2';
import { useMataKuliahStore } from '../store/useMataKuliahStore';
import { usePaketStore } from '../store/usePaketStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Helper to format course prices
const getPriceDisplay = (warnaVal: string | undefined | null) => {
  if (!warnaVal || warnaVal === '0' || warnaVal === 'Gratis' || warnaVal === 'blue') {
    return { current: 'Gratis', old: null };
  }
  const cleanStr = warnaVal.replace(/[^0-9]/g, '');
  if (!cleanStr) return { current: warnaVal, old: null };
  const num = parseInt(cleanStr, 10);
  if (isNaN(num) || num === 0) {
    return { current: 'Gratis', old: null };
  }
  const oldPrice = num + 100000;
  return {
    current: `Rp ${num.toLocaleString('id-ID')}`,
    old: `Rp ${oldPrice.toLocaleString('id-ID')}`
  };
};

// Helper for dynamic developer card images matching topics
const getCourseImageUrl = (kode: string) => {
  const k = (kode || '').toLowerCase();
  if (k.includes('wd-01') || k.includes('html') || k.includes('css')) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-02') || k.includes('javascript') || k.includes('js')) {
    return 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-03') || k.includes('react')) {
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60';
};

// Mock courses if database is empty
const getMockCourses = (path: string) => {
  const norm = path.toLowerCase();
  if (norm.includes('science')) {
    return [
      { id: 'mock-ds-1', kode: 'DS-01', nama: 'Python untuk Data Science', level: 'Beginner', warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-2', kode: 'DS-02', nama: 'Statistika Deskriptif', level: 'Beginner', warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-3', kode: 'DS-03', nama: 'Data Wrangling & SQL', level: 'Intermediate', warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } }
    ];
  }
  if (norm.includes('security') || norm.includes('cyber')) {
    return [
      { id: 'mock-cs-1', kode: 'CS-01', nama: 'Keamanan Jaringan Komputer', level: 'Beginner', warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-2', kode: 'CS-02', nama: 'Pengantar Kriptografi', level: 'Beginner', warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-3', kode: 'CS-03', nama: 'Ethical Hacking & Pentesting', level: 'Intermediate', warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } }
    ];
  }
  if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) {
    return [
      { id: 'mock-ui-1', kode: 'UI-01', nama: 'Fundamental Desain Grafis', level: 'Beginner', warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-2', kode: 'UI-02', nama: 'Pengantar UI/UX & Figma', level: 'Beginner', warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-3', kode: 'UI-03', nama: 'Riset Pengguna & Persona', level: 'Intermediate', warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } }
    ];
  }
  if (norm.includes('ai') || norm.includes('intelligence')) {
    return [
      { id: 'mock-ai-1', kode: 'AI-01', nama: 'Pengantar Kecerdasan Buatan', level: 'Beginner', warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-2', kode: 'AI-02', nama: 'Aljabar Linier untuk AI', level: 'Beginner', warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-3', kode: 'AI-03', nama: 'Pemrograman Python & ML', level: 'Intermediate', warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } }
    ];
  }
  return [
    { id: 'mock-wd-1', kode: 'WD-01', nama: 'HTML & CSS Dasar', level: 'Beginner', warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
    { id: 'mock-wd-2', kode: 'WD-02', nama: 'JavaScript Dasar', level: 'Beginner', warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
    { id: 'mock-wd-3', kode: 'WD-03', nama: 'React JS Fundamental', level: 'Intermediate', warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } }
  ];
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { publishedMataKuliahList, fetchPublishedMataKuliah } = useMataKuliahStore();
  const { paketList, fetchPaket } = usePaketStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activePath, setActivePath] = useState('Web Development');

  // Auth Redirect check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    if (token && role) {
      if (role === 'admin') navigate('/admin/pengajar');
      else if (role === 'pengajar') navigate('/pengajar/monitoring');
      else if (role === 'asisten') navigate('/asisten/koreksi');
      else if (role === 'user') navigate('/user/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    fetchPublishedMataKuliah();
    fetchPaket();
  }, [fetchPublishedMataKuliah, fetchPaket]);

  const handleCTA = () => {
    navigate('/register');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/login?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/login');
    }
  };

  // Filter courses based on active path
  const pathPrefixMap: Record<string, string> = {
    'Web Development': 'WD',
    'Data Science': 'DS',
    'Cyber Security': 'CS',
    'UI/UX Design': 'UI',
    'AI Fundamentals': 'AI'
  };

  const pathPrefix = pathPrefixMap[activePath] || 'WD';
  
  const realCoursesForPath = publishedMataKuliahList.filter(
    c => c.kode?.toUpperCase().startsWith(pathPrefix)
  );

  const displayCourses = realCoursesForPath.length > 0 
    ? realCoursesForPath.slice(0, 3) 
    : getMockCourses(activePath);

  // Fallback packages if empty
  const displayPackages = paketList.length > 0 ? paketList : [
    {
      id: 'mock-pkg-1',
      nama: 'Web Dev Full Path',
      deskripsi: 'Akses selamanya ke semua modul Web Development',
      hargaPaket: '199000',
      hargaAsli: '299000',
      courses: [{ nama: 'HTML' }, { nama: 'CSS' }, { nama: 'JS' }]
    },
    {
      id: 'mock-pkg-2',
      nama: 'Front-End Specialist',
      deskripsi: 'Kuasai pembuatan antarmuka modern yang interaktif',
      hargaPaket: '699000',
      hargaAsli: '899000',
      courses: [{ nama: 'React' }, { nama: 'Figma' }, { nama: 'Tailwind' }]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* 1. Header (Navbar) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logoImg} alt="HybridLMS Logo" className="w-10 h-10 object-contain" />
          <span className="text-lg font-black text-slate-900 tracking-tight">HybridLMS</span>
        </div>

        {/* Search bar inside header */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200/50 w-80 max-w-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
          <HiOutlineSearch className="text-slate-400 w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Cari kursus..." 
            className="bg-transparent text-xs w-full outline-none text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-slate-700 font-bold text-xs hover:bg-slate-100 rounded-xl px-4 py-2 h-9 cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Sign in
          </Button>
          <Button 
            className="bg-[#5850ec] hover:bg-[#4e47d9] text-white font-bold text-xs rounded-xl px-4 py-2 h-9 shadow-md transition-all cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Sign up
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-20 md:py-28 px-6 bg-gradient-to-br from-blue-50 via-white to-sky-100 overflow-hidden">
        {/* Abstract Background Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative">
          
          {/* Floating Stat Badges (positioned cleanly on left/right sides) */}
          <div className="hidden lg:block absolute top-16 right-4 xl:-right-12 bg-white/80 backdrop-blur-md shadow-xl border border-slate-100 rounded-2xl p-3 transform rotate-6 hover:rotate-0 transition-transform duration-300 z-10 select-none">
            <span className="block text-xs font-black text-[#5850ec] uppercase">100+ Kursus</span>
            <span className="text-[10px] text-slate-400 font-bold">Kurikulum Terkini</span>
          </div>
          <div className="hidden lg:block absolute top-36 left-4 xl:-left-12 bg-white/80 backdrop-blur-md shadow-xl border border-slate-100 rounded-2xl p-3 transform -rotate-3 hover:rotate-0 transition-transform duration-300 z-10 select-none">
            <span className="block text-xs font-black text-emerald-600 uppercase">3.2K+ Pelajar</span>
            <span className="text-[10px] text-slate-400 font-bold">Telah Bergabung</span>
          </div>

          {/* Badge */}
          <span className="inline-block bg-blue-500/10 text-blue-600 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full border border-blue-500/20">
            🚀 Platform Edukasi #1 Indonesia
          </span>

          {/* Heading */}
          <div className="relative max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mx-auto">
              Kuasai Full Stack <br className="hidden sm:inline" />
              <span className="text-[#5850ec]">Web Development.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-slate-500 text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto">
            Raih karir impianmu dengan belajar dari ribuan kursus berkualitas. Mulai dari dasar hingga mahir, semua ada di sini.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex items-center bg-white rounded-2xl p-2 shadow-lg border border-slate-200/50">
            <div className="flex items-center flex-1 px-3">
              <HiOutlineSearch className="text-slate-400 w-5 h-5 mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="Cari kursus idamanmu..." 
                className="bg-transparent text-xs w-full outline-none text-slate-700 font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              type="submit"
              className="bg-[#5850ec] hover:bg-[#4e47d9] text-white font-black text-xs rounded-xl h-10 px-6 cursor-pointer shrink-0"
            >
              Cari Kursus
            </Button>
          </form>

          {/* Popular Tag Chips */}
          <div className="flex flex-wrap justify-center items-center gap-2 pt-2 text-[10px] font-bold text-slate-400 uppercase">
            <span>Populer:</span>
            {['HTML & CSS', 'JavaScript', 'Node.js', 'React'].map((tag) => (
              <button 
                key={tag}
                type="button"
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3.5 py-1 rounded-full shadow-sm transition-colors cursor-pointer"
                onClick={() => {
                  setSearchQuery(tag);
                  navigate(`/login?search=${encodeURIComponent(tag)}`);
                }}
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Partner Institutions Section */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8">
            Pengajar Dari Institusi Ternama
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-85">
            {/* Universitas Indonesia */}
            <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#FFD700]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M 50 15 L 65 35 L 58 35 L 58 75 L 42 75 L 42 35 L 35 35 Z" fill="currentColor" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Universitas</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Indonesia</span>
              </div>
            </div>

            {/* ITB */}
            <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#004B87]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                <polygon points="50,20 70,60 30,60" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="45" r="8" fill="currentColor" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Institut Teknologi</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Bandung</span>
              </div>
            </div>

            {/* UGM */}
            <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#1A365D]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                <path d="M 30,50 Q 50,25 70,50 Q 50,75 30,50 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="5" fill="currentColor" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Universitas Gadjah</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Mada</span>
              </div>
            </div>

            {/* BINUS */}
            <div className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all duration-300">
              <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#ED8936]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" />
                <rect x="35" y="35" width="30" height="30" rx="4" fill="none" stroke="currentColor" strokeWidth="4" />
                <line x1="35" y1="50" x2="65" y2="50" stroke="currentColor" strokeWidth="3" />
              </svg>
              <div className="text-left leading-none">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider">Binus</span>
                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">University</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Popular Courses Section (Packages) */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs text-blue-600 font-extrabold uppercase tracking-widest block">—— Kursus Populer ——</span>
          <h2 className="text-3xl font-black text-slate-900">Pilih Kursus Terbaik Untukmu</h2>
          <p className="text-slate-500 text-xs font-bold">
            Tersedia kursus individu dan paket bundling dengan harga lebih hemat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {displayPackages.slice(0, 2).map((paket: any) => {
            const isPopular = paket.nama.toLowerCase().includes('full path');
            const tags = ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'].slice(0, (paket.courses?.length || 3) + 1);

            return (
              <div 
                key={paket.id}
                className={`relative bg-[#133c66] text-white p-8 rounded-[2rem] border-2 shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 min-h-[500px] ${
                  isPopular ? 'border-blue-500 bg-[#133c66]' : 'border-slate-300 bg-[#0e2c4c]'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sky-400 text-[#0f2a47] font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    Paket Populer
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black mb-1">{paket.nama}</h3>
                  <p className="text-xs font-bold text-sky-200/70 mb-5">{paket.courses?.length || 3} Kursus Lengkap</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="bg-white/10 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3.5 my-8">
                    {[
                      paket.deskripsi || 'Akses selamanya ke semua kursus terkait',
                      'Sertifikat resmi kelulusan kompetensi',
                      'Akses komunitas & forum diskusi',
                      'Tugas praktis terintegrasi autokoreksi AI'
                    ].map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-sky-100/90 font-semibold">
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-300 flex items-center justify-center text-[10px] shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto border-t border-white/10 pt-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black">
                      Rp {parseInt(paket.hargaPaket || '199000', 10).toLocaleString('id-ID')}
                    </span>
                    {paket.hargaAsli && (
                      <span className="text-xs text-sky-200/50 line-through font-bold">
                        Rp {parseInt(paket.hargaAsli || '299000', 10).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <Button 
                    onClick={handleCTA}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-6 rounded-2xl w-full border-none shadow-md transition-all cursor-pointer"
                  >
                    Beli Paket
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Learning Path Section */}
      <section className="py-20 bg-slate-100 border-t border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs text-[#5850ec] font-extrabold uppercase tracking-widest block">—— Learning Path ——</span>
            <h2 className="text-3xl font-black text-slate-900">Pilih Jalur Belajar Yang Tepat Untukmu</h2>
          </div>

          {/* Horizontal Path Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['Web Development', 'Data Science', 'Cyber Security', 'UI/UX Design', 'AI Fundamentals'].map((pathName) => (
              <button
                key={pathName}
                type="button"
                onClick={() => setActivePath(pathName)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm border ${
                  activePath === pathName
                    ? 'bg-[#133c66] text-white border-[#133c66]'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                } cursor-pointer`}
              >
                {pathName}
              </button>
            ))}
          </div>

          {/* Courses Grid under active path */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCourses.map((course: any) => {
              const priceInfo = getPriceDisplay(course.warna);
              return (
                <Card 
                  key={course.id}
                  className="rounded-[2.2rem] border border-slate-200 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                  onClick={handleCTA}
                >
                  <div className="h-44 relative overflow-hidden shrink-0">
                    <img 
                      src={getCourseImageUrl(course.kode)}
                      alt={course.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    
                    <div className="absolute top-4 left-4 flex gap-2 items-center">
                      <Badge className="bg-sky-500/20 backdrop-blur-md text-sky-200 border border-sky-400/20 font-black text-[9px] px-3.5 py-0.5 rounded-full uppercase tracking-wider">
                        {course.level || 'Beginner'}
                      </Badge>
                      <Badge className="bg-slate-800/60 backdrop-blur-md text-slate-200 border border-slate-700/20 font-black text-[9px] px-3.5 py-0.5 rounded-full">
                        {course.kode}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                        {course.nama}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 leading-relaxed mt-2 line-clamp-2">
                        {course.deskripsi || 'Pelajari materi ini untuk meningkatkan keahlian Anda secara komprehensif.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-white shadow-sm flex items-center justify-center font-black text-[#5850ec] text-[9px] uppercase">
                          AS
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-900 leading-none">Ahmad Subarjo</p>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Pengajar</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black ${
                          priceInfo.current === 'Gratis' ? 'text-[#10b981]' : 'text-blue-600'
                        }`}>
                          {priceInfo.current}
                        </span>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] h-8 px-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCTA();
                          }}
                        >
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={handleCTA}
              className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs px-8 py-3.5 rounded-xl shadow-sm cursor-pointer"
            >
              Lihat Selengkapnya
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Bottom CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#10b981]/10 via-[#5850ec]/10 to-sky-100 text-center border-t border-slate-200/50">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
            Siap Mulai Perjalanan Belajarmu?
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-bold leading-relaxed max-w-xl mx-auto">
            Bergabunglah dengan ribuan pelajar yang telah memulai karir mereka di bidang web development. Mulai gratis sekarang!
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button 
              onClick={handleCTA}
              className="bg-[#5850ec] hover:bg-[#4e47d9] text-white font-black text-xs uppercase tracking-wider px-8 py-6 rounded-2xl shadow-md cursor-pointer"
            >
              Daftar Gratis
            </Button>
            <Button 
              onClick={handleCTA}
              variant="outline"
              className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-black text-xs uppercase tracking-wider px-8 py-6 rounded-2xl shadow-sm cursor-pointer"
            >
              Lihat Semua Kursus
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-center border-t border-slate-800 text-xs">
        <p>© 2026 HybridLMS. Hak Cipta Dilindungi Undang-Undang.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

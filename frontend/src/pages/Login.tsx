import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import logoImg from '../assets/logo.png';
import api from '../lib/api';

type Role = 'admin' | 'pengajar' | 'asisten' | 'user';

interface RoleConfig {
  name: string;
  badge: string;
  gradientClass: string;
  focusRingClass: string;
  welcomePart1: string;
  welcomePart2: string;
  welcomeRole: string;
  subtitle: string;
  heading: string;
  description: string;
  emailPlaceholder: string;
  emailLabel: string;
  demoRoleTab: 'ADMIN' | 'DOSEN' | 'ASISTEN' | 'MAHASISWA';
  patternType: 'wireframe' | 'circles';
}

const roleConfigs: Record<Role, RoleConfig> = {
  admin: {
    name: 'Admin',
    badge: 'ADMIN',
    gradientClass: 'bg-gradient-to-br from-violet-600 to-indigo-900',
    focusRingClass: 'focus:ring-violet-500',
    welcomePart1: 'Selamat datang kembali,',
    welcomePart2: '',
    welcomeRole: 'Admin!',
    subtitle: 'Masuk untuk melanjutkan perjalananmu membuat kursus baru.',
    heading: 'Kelola Kursus dengan Mudah dan Efisien di HybridLMS!',
    description: 'Tambah pengajar, atur jadwal, upload materi, dan pantau kemajuan peserta dari satu dasbor terpadu.',
    emailPlaceholder: 'admin@lms.com',
    emailLabel: 'Email',
    demoRoleTab: 'ADMIN',
    patternType: 'wireframe',
  },
  pengajar: {
    name: 'Pengajar',
    badge: 'Pengajar',
    gradientClass: 'bg-gradient-to-br from-[#EA580C] to-[#C2410C]',
    focusRingClass: 'focus:ring-orange-500',
    welcomePart1: 'Selamat datang kembali,',
    welcomePart2: '',
    welcomeRole: 'Pengajar!',
    subtitle: 'Masuk untuk melanjutkan perjalananmu sebagai pengajar.',
    heading: 'Ajar Lebih Cerdas, Dampak Lebih Luas bersama HybridLMS!',
    description: 'Kelola jadwal mengajar, upload materi kursus, pantau perkembangan peserta, dan review soal AI dalam satu platform.',
    emailPlaceholder: 'dosen@lms.com',
    emailLabel: 'Email',
    demoRoleTab: 'DOSEN',
    patternType: 'circles',
  },
  asisten: {
    name: 'Asisten',
    badge: 'Asisten',
    gradientClass: 'bg-gradient-to-br from-[#10B981] to-[#047857]',
    focusRingClass: 'focus:ring-emerald-500',
    welcomePart1: 'Selamat datang kembali,',
    welcomePart2: '',
    welcomeRole: 'Asisten!',
    subtitle: 'Masuk untuk melanjutkan perjalananmu mengoreksi tugas peserta dan membantu pengajar.',
    heading: 'Bantu Peserta Belajar, Pantau Progres Setiap Pertemuan!',
    description: 'Dampingi peserta, catat kehadiran, bantu pengajar dalam operasional kursus, dan pantau laporan belajar harian.',
    emailPlaceholder: 'asisten@lms.com',
    emailLabel: 'Email',
    demoRoleTab: 'ASISTEN',
    patternType: 'circles',
  },
  user: {
    name: 'Peserta',
    badge: 'Peserta',
    gradientClass: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
    focusRingClass: 'focus:ring-blue-500',
    welcomePart1: 'Selamat datang kembali,',
    welcomePart2: '',
    welcomeRole: 'Peserta!',
    subtitle: 'Masuk untuk melanjutkan proses belajarmu di HybridLMS.',
    heading: 'Belajar kapan saja, di mana saja bersama HybridLMS!',
    description: 'Akses materi kelas, kerjakan tugas, dan pantau progres belajarmu dari satu platform yang mudah digunakan.',
    emailPlaceholder: 'mhs@lms.com',
    emailLabel: 'Email',
    demoRoleTab: 'MAHASISWA',
    patternType: 'wireframe',
  },
};

const getRoleColor = (role: Role) => {
  switch (role) {
    case 'admin': return '#7C3AED'; // violet-600
    case 'pengajar': return '#EA580C'; // orange-600
    case 'asisten': return '#10B981'; // emerald-500/green
    case 'user': return '#2563EB'; // brand blue
    default: return '#2563EB';
  }
};

const getRoleHoverColor = (role: Role) => {
  switch (role) {
    case 'admin': return '#6D28D9'; // violet-700
    case 'pengajar': return '#C2410C'; // orange-700
    case 'asisten': return '#059669'; // emerald-600
    case 'user': return '#1D4ED8'; // hover blue
    default: return '#1D4ED8';
  }
};

const renderPattern = (type: 'wireframe' | 'circles') => {
  if (type === 'wireframe') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="100" cy="50" r="20" stroke="white" strokeWidth="0.2" fill="none" />
          <circle cx="100" cy="50" r="35" stroke="white" strokeWidth="0.2" fill="none" />
          <circle cx="100" cy="50" r="50" stroke="white" strokeWidth="0.2" fill="none" />
          <circle cx="100" cy="50" r="65" stroke="white" strokeWidth="0.2" fill="none" />
          <circle cx="100" cy="50" r="80" stroke="white" strokeWidth="0.2" fill="none" />
          <circle cx="100" cy="50" r="95" stroke="white" strokeWidth="0.2" fill="none" />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-white/20"></div>
        <div className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-white/20"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/15"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full bg-white/10"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/10"></div>
      </div>
    );
  }
};

const Login: React.FC = () => {
  const [activeRole, setActiveRole] = useState<Role>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  interface DemoUser {
    id: string;
    nama: string;
    email: string;
    role: 'ADMIN' | 'DOSEN' | 'ASISTEN' | 'MAHASISWA';
  }

  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'MAHASISWA' | 'DOSEN' | 'ASISTEN' | 'ADMIN'>('ADMIN');

  React.useEffect(() => {
    const fetchDemos = async () => {
      try {
        const response = await api.get('/auth/demo-users');
        setDemoUsers(response.data);
      } catch (err) {
        console.error('Failed to load demo accounts:', err);
      }
    };
    fetchDemos();
  }, []);

  const performQuickLogin = async (selectedEmail: string, userRole: string) => {
    setIsLoading(true);
    setError('');
    const selectedPassword = userRole === 'ADMIN' ? 'admin123' : 'password123';
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    try {
      const response = await api.post('/auth/login', { email: selectedEmail, password: selectedPassword });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      let roleToStore = 'user';
      if (user.role === 'ADMIN') roleToStore = 'admin';
      else if (user.role === 'DOSEN') roleToStore = 'pengajar';
      else if (user.role === 'ASISTEN') roleToStore = 'asisten';
      else if (user.role === 'MAHASISWA') roleToStore = 'user';

      localStorage.setItem('userRole', roleToStore);
      localStorage.setItem('userName', user.nama);

      if (roleToStore === 'admin') navigate('/admin/pengajar');
      else if (roleToStore === 'pengajar') navigate('/pengajar/monitoring');
      else if (roleToStore === 'asisten') navigate('/asisten/koreksi');
      else if (roleToStore === 'user') navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);

      let roleToStore = 'user';
      if (user.role === 'ADMIN') roleToStore = 'admin';
      else if (user.role === 'DOSEN') roleToStore = 'pengajar';
      else if (user.role === 'ASISTEN') roleToStore = 'asisten';
      else if (user.role === 'MAHASISWA') roleToStore = 'user';

      localStorage.setItem('userRole', roleToStore);
      localStorage.setItem('userName', user.nama);

      if (roleToStore === 'admin') navigate('/admin/pengajar');
      else if (roleToStore === 'pengajar') navigate('/pengajar/monitoring');
      else if (roleToStore === 'asisten') navigate('/asisten/koreksi');
      else if (roleToStore === 'user') navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const defaultDemos: DemoUser[] = [
    { id: '1', nama: 'Admin Kursus', email: 'admin@lms.com', role: 'ADMIN' },
    { id: '2', nama: 'Dr. Ahmad Dosen', email: 'dosen@lms.com', role: 'DOSEN' },
    { id: '3', nama: 'Budi Asisten', email: 'asisten@lms.com', role: 'ASISTEN' },
    { id: '4', nama: 'Rizky Mahasiswa', email: 'mhs@lms.com', role: 'MAHASISWA' }
  ];

  const activeUsers = demoUsers.length > 0
    ? demoUsers.filter(u => u.role === selectedRoleTab)
    : defaultDemos.filter(u => u.role === selectedRoleTab);

  const roles: Role[] = ['admin', 'pengajar', 'asisten', 'user'];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Sisi Kiri: Banner Info Dinamis */}
      <div className={`hidden md:flex md:w-[45%] lg:w-[42%] xl:w-[40%] ${roleConfigs[activeRole].gradientClass} p-12 flex-col justify-between text-white relative overflow-hidden transition-all duration-700 ease-in-out shrink-0`}>
        {/* Dynamic Pattern Background */}
        {renderPattern(roleConfigs[activeRole].patternType)}

        {/* Top Badge: Logo & Role */}
        <div className="flex items-center gap-3 z-10">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-sm">
            <img src={logoImg} alt="Logo" className="w-6 h-6 object-contain" />
            <span className="font-extrabold tracking-wider text-xs">HYBRID.LMS</span>
          </div>
          <span className="text-white/60 font-semibold tracking-widest text-xs">|</span>
          <span className="text-white font-extrabold tracking-widest text-xs uppercase transition-all duration-500">
            {roleConfigs[activeRole].badge}
          </span>
        </div>

        {/* Middle: Dynamic Title and Description */}
        <div className="my-auto z-10 max-w-md space-y-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight transition-all duration-500">
            {roleConfigs[activeRole].heading}
          </h1>
          <p className="text-sm lg:text-base text-white/80 leading-relaxed transition-all duration-500">
            {roleConfigs[activeRole].description}
          </p>
        </div>

        {/* Bottom: Small Decorative Dots & License */}
        <div className="flex justify-between items-center z-10 text-xs text-white/50">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
          <span>© 2026 HybridLMS. Hak Cipta Dilindungi.</span>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
        </div>
      </div>

      {/* Sisi Kanan: Form Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 bg-white overflow-y-auto relative">
        {/* Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] z-0 overflow-hidden">
          <img src={logoImg} alt="Watermark" className="w-[120%] max-w-lg object-contain" />
        </div>

        <div className="w-full max-w-md flex flex-col justify-center py-8 z-10 relative">
          {/* Dynamic Role Selector */}
          <div className="mb-8">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl relative w-full border border-slate-200">
              {roles.map((r) => {
                const config = roleConfigs[r];
                const isActive = activeRole === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setActiveRole(r);
                      setSelectedRoleTab(config.demoRoleTab);
                      setError('');
                    }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 relative z-10 capitalize cursor-pointer ${isActive
                      ? 'text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                      }`}
                    style={isActive ? { backgroundColor: getRoleColor(r) } : {}}
                  >
                    {config.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Welcome Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {roleConfigs[activeRole].welcomePart1} {roleConfigs[activeRole].welcomePart2 ? `${roleConfigs[activeRole].welcomePart2} ` : ''}{roleConfigs[activeRole].welcomeRole}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed transition-all duration-500">
              {roleConfigs[activeRole].subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                {roleConfigs[activeRole].emailLabel}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleConfigs[activeRole].emailPlaceholder}
                  className={`w-full h-12 px-4 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 ${roleConfigs[activeRole].focusRingClass} focus:border-transparent transition-all text-sm`}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full h-12 pl-4 pr-12 bg-white border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 ${roleConfigs[activeRole].focusRingClass} focus:border-transparent transition-all text-sm`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-end pt-0.5">
                <Link to="#" className="text-xs font-semibold hover:underline transition-colors" style={{ color: getRoleColor(activeRole) }}>
                  Lupa password?
                </Link>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-100">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 text-white font-bold rounded-xl transition-all shadow-sm focus:outline-none focus:ring-2 ${roleConfigs[activeRole].focusRingClass} focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer`}
              style={{ backgroundColor: getRoleColor(activeRole) }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = getRoleHoverColor(activeRole);
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = getRoleColor(activeRole);
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                `Masuk sebagai ${roleConfigs[activeRole].name}`
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-semibold">Atau</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-3 cursor-pointer shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          {/* Footer Text */}
          {activeRole === 'user' && (
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-400">Belum punya akun? </span>
              <Link to="/register" className="font-semibold underline transition-colors" style={{ color: getRoleColor(activeRole) }}>
                Daftar sebagai Peserta
              </Link>
            </div>
          )}

          {/* Quick Login / Demo Accounts Panel */}
          <div className="mt-10 border border-slate-100 bg-slate-50/50 backdrop-blur-sm rounded-2xl p-5 w-full">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-slate-50/50 px-3 text-slate-400 font-bold tracking-wider">
                  Pilih Akun Demo / Quick Login
                </span>
              </div>
            </div>

            {/* Active Demo Users List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto scrollbar-hide">
              {activeUsers.length > 0 ? (
                activeUsers.map((demoUser) => (
                  <button
                    key={demoUser.id}
                    type="button"
                    onClick={() => performQuickLogin(demoUser.email, demoUser.role)}
                    className="flex items-center gap-2.5 p-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all text-left group cursor-pointer"
                  >
                    <div
                      className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 uppercase text-white transition-colors duration-500"
                      style={{ backgroundColor: getRoleColor(activeRole) }}
                    >
                      {demoUser.nama.substring(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-700 truncate group-hover:text-slate-900">
                        {demoUser.nama}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {demoUser.email}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-2 text-center py-3 text-xs text-slate-400 font-semibold">
                  Tidak ada akun terdaftar untuk role ini.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

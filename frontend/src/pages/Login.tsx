import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineAcademicCap, HiOutlineArrowRight, HiOutlineBookOpen } from 'react-icons/hi2';


import api from '../lib/api';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'asisten' | 'user' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [activeRole, setActiveRole] = useState<'admin' | 'pengajar' | 'asisten'>('admin');

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

  const handleRoleChange = (newRole: 'admin' | 'pengajar' | 'asisten') => {
    setActiveRole(newRole);
    if (newRole === 'admin') {
      setSelectedRoleTab('ADMIN');
    } else if (newRole === 'pengajar') {
      setSelectedRoleTab('DOSEN');
    } else if (newRole === 'asisten') {
      setSelectedRoleTab('ASISTEN');
    }
  };

  return (
    <div className="min-h-screen bg-[#081e36] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#081e36] border border-[#0d2a4a] rounded-[2.5rem] shadow-2xl p-8 md:p-12 flex flex-col items-center">
        {/* Circular crest logo */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#0c2b4e] relative mb-4 shadow-lg">
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#081e36]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 1" />
            
            <path id="loginCurveTop" d="M 17 50 A 33 33 0 0 1 83 50" fill="none" />
            <text fontSize="7.5" fontWeight="900" fill="currentColor" letterSpacing="0.8">
              <textPath href="#loginCurveTop" startOffset="50%" textAnchor="middle">
                LMS HYBRID
              </textPath>
            </text>
            
            <path id="loginCurveBottom" d="M 83 50 A 33 33 0 0 1 17 50" fill="none" />
            <text fontSize="6" fontWeight="900" fill="currentColor" letterSpacing="0.8">
              <textPath href="#loginCurveBottom" startOffset="50%" textAnchor="middle">
                HYBRID LEARNING
              </textPath>
            </text>

            <g transform="translate(32, 32) scale(0.72)">
              <path d="M 12 5 L 17 9 L 25 3 L 33 9 L 38 5 L 35 12 L 15 12 Z" fill="currentColor" />
              <path d="M 10 13 L 40 13 L 40 28 C 40 38 25 45 25 45 C 25 45 10 38 10 28 Z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              <line x1="25" y1="13" x2="25" y2="44" stroke="currentColor" strokeWidth="1.5" />
              <line x1="10" y1="28" x2="40" y2="28" stroke="currentColor" strokeWidth="1.5" />
              
              <g transform="translate(14, 16) scale(0.35)" fill="currentColor">
                <path d="M 12 2 L 2 7 L 12 12 L 22 7 Z" />
                <path d="M 5 9.5 L 5 17 C 5 20 19 20 19 17 L 19 9.5" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 20 8.5 L 20 15 L 21 15 L 21 8.5 Z" />
              </g>
              <g transform="translate(29, 16) scale(0.3)" fill="currentColor">
                <path d="M20,10c0-1.1-0.9-2-2-2h-2V6c0-1.1-0.9-2-2-2h-4C8.9,4,8,4.9,8,6v2H6C4.9,8,4,8.9,4,10v4c0,1.1,0.9,2,2,2h2v2c0,1.1,0.9,2,2,2h4c1.1,0,2-0.9,2-2v-2h2c1.1,0,2-0.9,2-2V10z M14,14h-4v-4h4V14z" />
              </g>
              <g transform="translate(13, 31) scale(0.35)" fill="currentColor">
                <path d="M 2 5 L 10 5 C 13 5 15 7 15 10 L 15 22 C 15 19 13 17 10 17 L 2 17 Z" />
                <path d="M 28 5 L 20 5 C 17 5 15 7 15 10 L 15 22 C 15 19 17 17 20 17 L 28 17 Z" />
              </g>
              <g transform="translate(29, 31) scale(0.35)" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" />
                <ellipse cx="12" cy="12" rx="4" ry="9" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </g>
            </g>
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold mb-8 tracking-tight text-white text-center">HybridLMS</h1>

        <div className="w-full flex flex-col items-stretch">
          {/* Label: Login Sebagai */}
          <h2 className="text-lg font-bold text-slate-200 mb-4 text-left">Login Sebagai</h2>

          {/* Role Tabs Selection */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Card 1: Admin Kursus */}
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center h-32 cursor-pointer ${
                activeRole === 'admin'
                  ? 'bg-[#052955] border-[#005cbd] text-white shadow-lg shadow-[#052955]/30'
                  : 'bg-white border-transparent text-slate-800 hover:bg-slate-50'
              }`}
            >
              {/* Custom Admin Avatar Icon */}
              <svg viewBox="0 0 64 64" className="w-12 h-12">
                <circle cx="32" cy="32" r="30" fill="#E2E8F0" />
                <path d="M 16 54 C 16 42 22 38 32 38 C 42 38 48 42 48 54 Z" fill="#1E293B" />
                <path d="M 28 38 L 32 46 L 36 38 Z" fill="#E2E8F0" />
                <path d="M 30 38 L 32 50 L 34 38 Z" fill="#EF4444" />
                <circle cx="32" cy="24" r="10" fill="#FDBA74" />
                <path d="M 22 22 C 22 14 30 12 32 12 C 34 12 42 14 42 22 C 40 16 34 16 32 16 C 30 16 24 16 22 22 Z" fill="#475569" />
              </svg>
              <div>
                <div className={`text-sm font-extrabold tracking-tight ${activeRole === 'admin' ? 'text-white' : 'text-slate-900'}`}>Admin Kursus</div>
                <div className={`text-[10px] ${activeRole === 'admin' ? 'text-slate-300' : 'text-slate-500'}`}>Kelola semua kursus</div>
              </div>
            </button>

            {/* Card 2: Pengajar */}
            <button
              type="button"
              onClick={() => handleRoleChange('pengajar')}
              className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center h-32 cursor-pointer ${
                activeRole === 'pengajar'
                  ? 'bg-[#052955] border-[#005cbd] text-white shadow-lg shadow-[#052955]/30'
                  : 'bg-white border-transparent text-slate-800 hover:bg-slate-50'
              }`}
            >
              {/* Custom Pengajar Avatar Icon */}
              <svg viewBox="0 0 64 64" className="w-12 h-12">
                <circle cx="32" cy="32" r="30" fill="#FEF3C7" />
                <path d="M 16 54 C 16 42 22 38 32 38 C 42 38 48 42 48 54 Z" fill="#D97706" />
                <circle cx="32" cy="24" r="10" fill="#FDBA74" />
                <path d="M 22 22 C 22 14 30 12 32 12 C 34 12 42 14 42 22 Z" fill="#78350F" />
                <rect x="25" y="21" width="6" height="3" rx="1" fill="none" stroke="#000" strokeWidth="1" />
                <rect x="33" y="21" width="6" height="3" rx="1" fill="none" stroke="#000" strokeWidth="1" />
                <line x1="31" y1="22" x2="33" y2="22" stroke="#000" strokeWidth="1" />
              </svg>
              <div>
                <div className={`text-sm font-extrabold tracking-tight ${activeRole === 'pengajar' ? 'text-white' : 'text-slate-900'}`}>Pengajar</div>
                <div className={`text-[10px] ${activeRole === 'pengajar' ? 'text-slate-300' : 'text-slate-500'}`}>Akses kursus sendiri</div>
              </div>
            </button>

            {/* Card 3: Assisten */}
            <button
              type="button"
              onClick={() => handleRoleChange('asisten')}
              className={`flex flex-col items-center justify-between p-4 rounded-2xl border transition-all text-center h-32 cursor-pointer ${
                activeRole === 'asisten'
                  ? 'bg-[#052955] border-[#005cbd] text-white shadow-lg shadow-[#052955]/30'
                  : 'bg-white border-transparent text-slate-800 hover:bg-slate-50'
              }`}
            >
              {/* Custom Assisten Avatar Icon */}
              <svg viewBox="0 0 64 64" className="w-12 h-12">
                <circle cx="32" cy="32" r="30" fill="#E0F2FE" />
                <path d="M 16 54 C 16 42 22 38 32 38 C 42 38 48 42 48 54 Z" fill="#0284C7" />
                <circle cx="32" cy="24" r="10" fill="#FDBA74" />
                <path d="M 20 22 C 20 12 44 12 44 22 L 44 32 C 44 32 40 34 32 32 C 24 34 20 32 20 32 Z" fill="#1E293B" />
                <circle cx="32" cy="24" r="10" fill="#FDBA74" />
              </svg>
              <div>
                <div className={`text-sm font-extrabold tracking-tight ${activeRole === 'asisten' ? 'text-white' : 'text-slate-900'}`}>Assisten</div>
                <div className={`text-[10px] ${activeRole === 'asisten' ? 'text-slate-300' : 'text-slate-500'}`}>Akses kursus sendiri</div>
              </div>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-white ml-1 block">
                {activeRole === 'admin' ? 'Email Admin' : activeRole === 'pengajar' ? 'Email Pengajar' : 'Email Assisten'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeRole === 'admin' ? 'admin@lms.com' : activeRole === 'pengajar' ? 'dosen@lms.com' : 'asisten@lms.com'}
                className="w-full h-14 px-6 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-[#005cbd] transition-all text-base shadow-inner"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-white ml-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 px-6 bg-white text-slate-900 rounded-full focus:outline-none focus:ring-2 focus:ring-[#005cbd] transition-all text-base shadow-inner"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-950/80 text-red-300 rounded-2xl text-sm font-medium border border-red-900/50">
                {error}
              </div>
            )}

            {/* Action Row */}
            <div className="flex flex-row justify-between items-center pt-2 gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="h-14 px-10 bg-[#005cbd] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Masuk sebagai {activeRole === 'admin' ? 'Admin' : activeRole === 'pengajar' ? 'Pengajar' : 'Assisten'}
                  </>
                )}
              </button>

              <Link to="#" className="text-[#005cbd] hover:text-blue-400 font-semibold text-base transition-colors hover:underline shrink-0">
                Lupa password?
              </Link>
            </div>
          </form>

          {/* Bottom text */}
          <div className="mt-8 text-center">
            <span className="text-slate-400 text-base">
              Bukan {activeRole === 'admin' ? 'admin' : activeRole === 'pengajar' ? 'pengajar' : 'assisten'}?{' '}
            </span>
            <Link to="/register" className="text-[#007bff] hover:text-blue-400 font-semibold text-base transition-colors underline">
              Daftar sebagai Peserta
            </Link>
          </div>

          {/* Quick Login / Demo Accounts Panel */}
          <div className="mt-12 border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm rounded-3xl p-6">
            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#081e36] px-4 text-slate-300 font-bold tracking-widest">Pilih Akun Demo / Quick Login</span>
              </div>
            </div>

            {/* Demo Role Tabs */}
            <div className="flex gap-1 bg-slate-950/40 border border-slate-800/80 p-1 rounded-xl mb-4">
              {(['MAHASISWA', 'DOSEN', 'ASISTEN', 'ADMIN'] as const).map((tabRole) => (
                <button
                  key={tabRole}
                  type="button"
                  onClick={() => setSelectedRoleTab(tabRole)}
                  className={`flex-1 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
                    selectedRoleTab === tabRole
                      ? 'bg-[#005cbd] text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tabRole === 'MAHASISWA' ? 'MHS (Peserta)' : tabRole === 'DOSEN' ? 'DOSEN (Pengajar)' : tabRole}
                </button>
              ))}
            </div>

            {/* Active Demo Users List */}
            <div className="max-h-36 overflow-y-auto space-y-2 scrollbar-hide">
              {activeUsers.length > 0 ? (
                activeUsers.map((demoUser) => (
                  <button
                    key={demoUser.id}
                    type="button"
                    onClick={() => performQuickLogin(demoUser.email, demoUser.role)}
                    className="w-full flex items-center gap-3 p-3 bg-slate-950/20 hover:bg-[#052955]/40 border border-slate-800/80 hover:border-[#005cbd]/60 rounded-xl transition-all text-left group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#005cbd]/20 group-hover:bg-[#005cbd]/40 text-[#005cbd] font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                      {demoUser.nama.substring(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-black text-slate-200 truncate group-hover:text-white">
                        {demoUser.nama}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {demoUser.email}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-semibold">
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

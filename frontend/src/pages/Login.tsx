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
  const [selectedRoleTab, setSelectedRoleTab] = useState<'MAHASISWA' | 'DOSEN' | 'ASISTEN' | 'ADMIN'>('MAHASISWA');

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
    { id: '1', nama: 'Super Admin', email: 'admin@lms.com', role: 'ADMIN' },
    { id: '2', nama: 'Dr. Ahmad Dosen', email: 'dosen@lms.com', role: 'DOSEN' },
    { id: '3', nama: 'Budi Asisten', email: 'asisten@lms.com', role: 'ASISTEN' },
    { id: '4', nama: 'Rizky Mahasiswa', email: 'mhs@lms.com', role: 'MAHASISWA' }
  ];

  const activeUsers = demoUsers.length > 0 
    ? demoUsers.filter(u => u.role === selectedRoleTab)
    : defaultDemos.filter(u => u.role === selectedRoleTab);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side - Branding */}
        <div className="md:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-700 p-12 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-8 border border-white/30">
              L
            </div>
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Hybrid LMS</h1>
            <p className="text-emerald-50/80 text-lg leading-relaxed">
              Platform pembelajaran cerdas dengan integrasi AI untuk membantu manajemen kursus dan asisten pengajar.
            </p>
          </div>
          
          <div className="mt-12">
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-emerald-600 overflow-hidden bg-white/10 backdrop-blur-sm">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-emerald-600 bg-emerald-500 flex items-center justify-center text-[10px] font-bold">
                +1k
              </div>
            </div>
            <p className="text-sm text-emerald-100 font-medium">Dipercaya oleh 1000+ pengguna di seluruh Indonesia</p>
          </div>
        </div>

        {/* Right Side - Login Selection */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
            <p className="text-gray-500">Silakan pilih akses masuk Anda</p>
          </div>



          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@lms.com"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 focus:outline-none transition-all"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Masuk Sekarang
                  <HiOutlineArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-150"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Pilih Akun Demo</span>
              </div>
            </div>

            {/* Role Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-4">
              {(['MAHASISWA', 'DOSEN', 'ASISTEN', 'ADMIN'] as const).map((tabRole) => (
                <button
                  key={tabRole}
                  type="button"
                  onClick={() => setSelectedRoleTab(tabRole)}
                  className={`flex-1 py-2 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                    selectedRoleTab === tabRole
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tabRole === 'MAHASISWA' ? 'MHS' : tabRole}
                </button>
              ))}
            </div>

            {/* Active Demo Users List */}
            <div className="max-h-36 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50/50 scrollbar-hide">
              {activeUsers.length > 0 ? (
                activeUsers.map((demoUser) => (
                  <button
                    key={demoUser.id}
                    type="button"
                    onClick={() => performQuickLogin(demoUser.email, demoUser.role)}
                    className="w-full flex items-center gap-3 p-3 bg-white hover:bg-emerald-50/50 border border-gray-100 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                      {demoUser.nama.substring(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-black text-gray-800 truncate group-hover:text-emerald-700">
                        {demoUser.nama}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">
                        {demoUser.email}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-gray-400 font-semibold">
                  Tidak ada akun terdaftar untuk role ini.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Belum punya akun?{' '}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                Daftar sebagai Peserta
              </Link>
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">LMS Hybrid v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

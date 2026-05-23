import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import api from '../lib/api';

const Register: React.FC = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [instansi, setInstansi] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(false);
    setError('');

    // Validations
    if (!nama || !email || !instansi || !password || !confirmPassword) {
      setError('Semua field harus diisi.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        nama,
        email,
        password,
        instansi,
        role: 'MAHASISWA' // Registrasi khusus untuk mahasiswa/peserta
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userName', user.nama);

      // Redirect to user dashboard
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-6 flex flex-col items-center">
          {/* Custom SVG logo mimicking the crest in the mock-up */}
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-2 border-blue-200 relative mb-2 shadow-inner">
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-blue-600">
              {/* Outer double ring */}
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 1" />
              
              {/* Curved texts (LMS HYBRID - HYBRID LEARNING) mock via SVG text paths */}
              <path id="curveTop" d="M 15 50 A 35 35 0 0 1 85 50" fill="none" />
              <text fontSize="7.5" fontWeight="bold" fill="currentColor" letterSpacing="1.2">
                <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
                  LMS HYBRID
                </textPath>
              </text>
              
              <path id="curveBottom" d="M 85 50 A 35 35 0 0 1 15 50" fill="none" />
              <text fontSize="6" fontWeight="bold" fill="currentColor" letterSpacing="0.8">
                <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
                  HYBRID LEARNING
                </textPath>
              </text>

              {/* Shield/Book Crest Icon in Center */}
              <g transform="translate(35, 33) scale(0.6)">
                {/* Shield backdrop */}
                <path d="M 25 5 L 43 13 L 43 30 C 43 42 25 48 25 48 C 25 48 7 42 7 30 L 7 13 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="3" />
                {/* Book icon inside */}
                <path d="M 16 20 C 19 20 22 21 25 24 C 28 21 31 20 34 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 16 35 C 19 35 22 36 25 39 C 28 36 31 35 34 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="25" y1="24" x2="25" y2="40" stroke="currentColor" strokeWidth="2" />
              </g>
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight text-center">HybridLMS</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Daftar akun baru sebagai Peserta</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="w-full mb-4 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 ml-1">Nama Lengkap</label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Nama lengkap peserta..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-800 ml-1">Asal Instansi</label>
            <input
              type="text"
              value={instansi}
              onChange={(e) => setInstansi(e.target.value)}
              placeholder="Nama instansi / universitas..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
              required
            />
          </div>

          {/* Change Password Group */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-extrabold text-slate-900 ml-1 block">Change Password</label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-semibold text-slate-600 ml-1">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 ml-1">Konfirmasi</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#1a73e8] text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Daftar Sekarang'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

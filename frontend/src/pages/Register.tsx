import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeSlash, HiOutlineArrowRight } from 'react-icons/hi2';
import api from '../lib/api';
import logoImg from '../assets/logo.png';

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
          <img src={logoImg} alt="HybridLMS Logo" className="w-20 h-20 object-contain mb-2" />
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

          {/* Password Group */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-extrabold text-slate-900 ml-1 block">Password</label>
            
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

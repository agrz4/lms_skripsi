import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineUserCircle, HiOutlineAcademicCap, HiOutlineArrowRight, HiOutlineBookOpen } from 'react-icons/hi2';


const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'asisten' | 'user' | null>(null);
  const navigate = useNavigate();

  const handleLogin = (selectedRole: string) => {
    localStorage.setItem('userRole', selectedRole);
    if (selectedRole === 'admin') navigate('/admin/pengajar');

    else if (selectedRole === 'pengajar') navigate('/pengajar/dashboard');
    else if (selectedRole === 'asisten') navigate('/asisten/dashboard');
    else if (selectedRole === 'user') navigate('/user/dashboard');
  };


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



          <div className="space-y-4">
            {/* Admin Role Card */}
            <button
              onClick={() => handleLogin('admin')}
              className="group w-full p-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-5 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 text-3xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <HiOutlineUserCircle />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Login Admin</h3>
                <p className="text-gray-500 text-sm">Kelola pengajar, kursus, dan laporan sistem</p>
              </div>
              <HiOutlineArrowRight className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-500"></div>
            </button>

            {/* Pengajar Role Card */}
            <button
              onClick={() => handleLogin('pengajar')}
              className="group w-full p-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-5 hover:border-yellow-500 hover:bg-yellow-50/30 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 text-3xl group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300">
                <HiOutlineBookOpen />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Login Pengajar</h3>
                <p className="text-gray-500 text-sm">Kelola materi, konten, dan monitor mahasiswa</p>
              </div>
              <HiOutlineArrowRight className="text-gray-300 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
              
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-yellow-500 group-hover:w-full transition-all duration-500"></div>
            </button>

            {/* Asisten Role Card */}

            <button
              onClick={() => handleLogin('asisten')}
              className="group w-full p-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-5 hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-3xl group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <HiOutlineAcademicCap />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Login Asisten</h3>
                <p className="text-gray-500 text-sm">Koreksi tugas, refleksi, dan bantu mahasiswa</p>
              </div>
              <HiOutlineArrowRight className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-purple-500 group-hover:w-full transition-all duration-500"></div>
            </button>

            {/* Mahasiswa Role Card */}
            <button
              onClick={() => handleLogin('user')}
              className="group w-full p-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-5 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 text-3xl group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <HiOutlineUserCircle />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Login Mahasiswa</h3>
                <p className="text-gray-500 text-sm">Akses kursus, materi, dan kerjakan tugas Anda</p>
              </div>
              <HiOutlineArrowRight className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-blue-500 group-hover:w-full transition-all duration-500"></div>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">LMS Hybrid v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

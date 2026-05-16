import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { HiOutlineCamera, HiOutlineUserCircle, HiOutlineAtSymbol, HiOutlineBuildingOffice2, HiOutlineLockClosed } from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserProfile: React.FC = () => {
  const { user, fetchMe, loading } = useAuthStore();
  const [formData, setFormData] = React.useState({
    nama: '',
    email: '',
    instansi: ''
  });

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        instansi: user.instansi || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Data Profile</h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Nama · Email · Instansi</p>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden max-w-5xl mx-auto">
        <div className="p-12 space-y-12">
          {/* Top Section: Avatar & Banner */}
          <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="relative group cursor-pointer shrink-0">
                <div className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-blue-200 border-8 border-white uppercase">
                   {formData.nama?.substring(0, 2) || 'BS'}
                </div>
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-100 text-gray-400 group-hover:text-blue-500 transition-all">
                   <HiOutlineCamera className="text-2xl" />
                </div>
             </div>

             <div className="flex-1 w-full">
                <div className="bg-[#7198A8]/20 border border-[#7198A8]/10 p-4 rounded-xl flex items-center gap-4 mb-8">
                   <div className="w-6 h-6 bg-[#7198A8] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                   <span className="text-xs font-black text-[#51717e] uppercase tracking-widest">Data Profile: Nama · Email · Instansi</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <Label className="text-sm font-black text-gray-800 flex items-center gap-2">
                         <HiOutlineUserCircle className="text-lg text-gray-400" /> Nama Lengkap
                      </Label>
                      <Input 
                        name="nama"
                        value={formData.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        className="bg-white border-gray-200 rounded-xl py-6 font-bold text-gray-600 focus:ring-blue-500"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-sm font-black text-gray-800 flex items-center gap-2">
                         <HiOutlineAtSymbol className="text-lg text-gray-400" /> Email
                      </Label>
                      <Input 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nama@email.com"
                        className="bg-white border-gray-200 rounded-xl py-6 font-bold text-gray-600 focus:ring-blue-500"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-sm font-black text-gray-800 flex items-center gap-2">
                         <HiOutlineBuildingOffice2 className="text-lg text-gray-400" /> Instansi
                      </Label>
                      <Input 
                        name="instansi"
                        value={formData.instansi}
                        onChange={handleChange}
                        placeholder="Nama Universitas / Instansi"
                        className="bg-white border-gray-200 rounded-xl py-6 font-bold text-gray-600 focus:ring-blue-500"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Bottom Section: Ganti Password */}
          <div className="space-y-10">
             <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Ganti Password</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Update keamanan akun Anda</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                   <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password Lama</Label>
                   <Input 
                     type="password"
                     placeholder="********"
                     className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password Baru</Label>
                   <Input 
                     type="password"
                     placeholder="********"
                     className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                   />
                </div>
                <div className="space-y-3">
                   <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">Konfirmasi</Label>
                   <Input 
                     type="password"
                     placeholder="********"
                     className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                   />
                </div>
             </div>

             <div className="flex justify-end pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black py-7 px-12 rounded-xl shadow-xl shadow-blue-100 uppercase tracking-widest text-xs">
                   Simpan Perubahan
                </Button>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfile;

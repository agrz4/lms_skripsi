import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { HiOutlineCamera, HiOutlineUserCircle, HiOutlineAtSymbol, HiOutlineBuildingOffice2, HiOutlineLockClosed, HiOutlinePhone } from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserProfile: React.FC = () => {
    const { user, fetchMe, updateProfile, loading } = useAuthStore();
    const [formData, setFormData] = React.useState({
        nama: '',
        email: '',
        instansi: '',
        noWhatsapp: ''
    });
    const [passwordLama, setPasswordLama] = React.useState('');
    const [passwordBaru, setPasswordBaru] = React.useState('');
    const [konfirmasiPassword, setKonfirmasiPassword] = React.useState('');
    const [statusMessage, setStatusMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    useEffect(() => {
        if (user) {
            setFormData({
                nama: user.nama || '',
                email: user.email || '',
                instansi: user.instansi || '',
                noWhatsapp: user.noWhatsapp || ''
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setStatusMessage(null);
        
        if (!formData.nama || !formData.email) {
            setStatusMessage({ type: 'error', text: 'Nama dan Email harus diisi.' });
            return;
        }

        if (passwordBaru) {
            if (!passwordLama) {
                setStatusMessage({ type: 'error', text: 'Password lama harus diisi untuk mengubah password.' });
                return;
            }
            if (passwordBaru !== konfirmasiPassword) {
                setStatusMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok.' });
                return;
            }
        }

        setIsSaving(true);
        const result = await updateProfile({
            nama: formData.nama,
            email: formData.email,
            instansi: formData.instansi,
            noWhatsapp: user?.role === 'MAHASISWA' ? formData.noWhatsapp : undefined,
            passwordLama: passwordBaru ? passwordLama : undefined,
            passwordBaru: passwordBaru ? passwordBaru : undefined,
        });

        setIsSaving(false);
        if (result.success) {
            setStatusMessage({ type: 'success', text: result.message });
            setPasswordLama('');
            setPasswordBaru('');
            setKonfirmasiPassword('');
        } else {
            setStatusMessage({ type: 'error', text: result.message });
        }
    };

    if (loading && !formData.nama) {
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
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Nama · Email · Instansi {user?.role === 'MAHASISWA' && '· WhatsApp'}</p>
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
                            {statusMessage ? (
                                <div className={`p-4 rounded-xl border font-bold text-xs uppercase tracking-wider flex items-center gap-3 mb-8 ${
                                    statusMessage.type === 'success' 
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                        : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${
                                        statusMessage.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                                    }`}>
                                        {statusMessage.type === 'success' ? '✓' : '✗'}
                                    </div>
                                    <span>{statusMessage.text}</span>
                                </div>
                            ) : (
                                <div className="bg-[#7198A8]/20 border border-[#7198A8]/10 p-4 rounded-xl flex items-center gap-4 mb-8">
                                    <div className="w-6 h-6 bg-[#7198A8] rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                                    <span className="text-xs font-black text-[#51717e] uppercase tracking-widest">Data Profile: Nama · Email · Instansi {user?.role === 'MAHASISWA' && '· WhatsApp'}</span>
                                </div>
                            )}

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
                                {user?.role === 'MAHASISWA' && (
                                    <div className="space-y-3">
                                        <Label className="text-sm font-black text-gray-800 flex items-center gap-2">
                                            <HiOutlinePhone className="text-lg text-gray-400" /> Nomor WhatsApp
                                        </Label>
                                        <Input
                                            name="noWhatsapp"
                                            value={formData.noWhatsapp}
                                            onChange={handleChange}
                                            placeholder="Contoh: 081234567890"
                                            className="bg-white border-gray-200 rounded-xl py-6 font-bold text-gray-600 focus:ring-blue-500"
                                        />
                                    </div>
                                )}
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
                                    value={passwordLama}
                                    onChange={(e) => setPasswordLama(e.target.value)}
                                    placeholder="********"
                                    className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">Password Baru</Label>
                                <Input
                                    type="password"
                                    value={passwordBaru}
                                    onChange={(e) => setPasswordBaru(e.target.value)}
                                    placeholder="********"
                                    className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-black text-gray-500 uppercase tracking-widest">Konfirmasi</Label>
                                <Input
                                    type="password"
                                    value={konfirmasiPassword}
                                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                                    placeholder="********"
                                    className="bg-white border-gray-200 rounded-xl py-6 font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-black py-7 px-12 rounded-xl shadow-xl shadow-blue-100 uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default UserProfile;

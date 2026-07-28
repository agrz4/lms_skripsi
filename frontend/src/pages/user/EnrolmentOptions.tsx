import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  HiOutlineArrowRight, 
  HiOutlineChevronDown,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineSparkles,
  HiOutlineInformationCircle,
  HiOutlineCheck,
  HiOutlineClipboard,
  HiOutlineCreditCard,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const EnrolmentOptions: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');

  const { mataKuliahList, fetchMataKuliah, isLoading: isMataKuliahLoading } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus, isLoading: isEnrollLoading } = usePendaftaranStore();
  const { user } = useAuthStore();

  const getActivationTime = () => {
    const now = new Date();
    const day = now.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year} - ${hours}.${minutes}`;
  };

  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Payment Simulation States
  const [paymentStep, setPaymentStep] = useState<'details' | 'simulate' | 'success'>('details');
  const [selectedBank, setSelectedBank] = useState<'Mandiri' | 'BCA' | 'BRI'>('Mandiri');
  const [generatedVA, setGeneratedVA] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState("");
  const [copiedVA, setCopiedVA] = useState(false);

  useEffect(() => {
    if (mataKuliahList.length === 0) {
      fetchMataKuliah();
    }
    fetchMyPendaftaran();
  }, [fetchMataKuliah, fetchMyPendaftaran]);

  const course = mataKuliahList.find(mk => mk.id === courseId);
  const isRegistered = pendaftaranList.some(p => p.mataKuliahId === courseId);

  // If already enrolled, immediately redirect to course detail (meetings list)
  useEffect(() => {
    if (isRegistered && courseId) {
      navigate(`/user/detail-kursus?id=${courseId}`);
    }
  }, [isRegistered, courseId, navigate]);

  const getPriceDisplay = (warnaString?: string) => {
    if (!warnaString) return { current: 'Gratis', old: null };
    const cleaned = warnaString.replace(/[^0-9]/g, '');
    if (cleaned.length > 0) {
      const priceNum = parseInt(cleaned, 10);
      const formatted = `Rp ${priceNum.toLocaleString('id-ID')}`;
      const originalPriceNum = Math.round(priceNum * 1.25 / 10000) * 10000;
      const formattedOld = `Rp ${originalPriceNum.toLocaleString('id-ID')}`;
      return {
        current: formatted,
        old: formattedOld
      };
    }
    return { current: 'Gratis', old: null };
  };

  const handleEnrollAction = async () => {
    if (!course) return;

    const priceInfo = getPriceDisplay(course.warna);
    const isPaid = priceInfo.current !== 'Gratis';

    if (isPaid) {
      setReferralInput("");
      setIsEnrollModalOpen(true);
    } else {
      await performEnrollment(course.id, "0");
    }
  };

  const performEnrollment = async (id: string, customPrice: string, referralCode?: string, customInvoice?: string, customMethod?: string) => {
    try {
      setIsEnrolling(true);
      await enrollKursus(id, {
        referralCode: referralCode || undefined,
        harga: customPrice,
        invoiceNo: customInvoice || `INV/MK/${Date.now()}`,
        method: customMethod || 'Mandiri Virtual Account',
        status: 'Lunas'
      });
      await fetchMyPendaftaran();
      
      if (isEnrollModalOpen) {
        setPaymentStep('success');
      } else {
        navigate(`/user/detail-kursus?id=${id}`);
      }
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Gagal mendaftar kelas.');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isMataKuliahLoading && !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Course Details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] p-8 text-center">
        <div className="bg-white rounded-3xl p-10 max-w-md shadow-lg border border-gray-100">
          <span className="text-5xl block mb-4">⚠️</span>
          <h2 className="text-xl font-black text-gray-900 mb-2">Kelas Tidak Ditemukan</h2>
          <p className="text-gray-500 text-sm mb-6">Kelas yang Anda cari tidak terdaftar atau telah dinonaktifkan oleh admin.</p>
          <Button onClick={() => navigate('/user/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const priceInfo = getPriceDisplay(course.warna);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header Info Section */}
      <div className="bg-[#2D3748] rounded-[2rem] p-10 mb-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0">
              🚀
            </div>
            <div className="text-left">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black leading-tight">{course.nama}</h1>
                <Badge className="bg-sky-500/20 backdrop-blur-md text-sky-200 border border-sky-400/20 font-black text-[10px] px-3.5 py-1 rounded-full uppercase tracking-wider">
                  Belum Terdaftar
                </Badge>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3">
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/user/dashboard')}>Dashboard</span>
                <span className="text-gray-500">/</span>
                <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/user/dashboard')}>Kursus Tersedia</span>
                <span className="text-gray-500">/</span>
                <span>{course.kategori || 'Web Development'}</span>
                <span className="text-gray-500">/</span>
                <span className="text-indigo-200 font-black">Enrolment options</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Enrolment Options Content Card */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-150 shadow-sm text-left max-w-5xl mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-8">Enrolment options</h2>

        {/* Dynamic Course Info nested card */}
        <div className="border border-gray-200 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-blue-600 text-lg font-black leading-snug">
              {course.nama} · {course.jumlahPertemuan || 3} Pertemuan
            </h3>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Pengajar: {course.pengajar?.nama || 'Ahmad Subarjo'}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-xl px-3.5 py-1.5 font-black text-[10px] uppercase shadow-none tracking-wide">
                {course.jumlahPertemuan || 3} pertemuan
              </Badge>
              <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-xl px-3.5 py-1.5 font-black text-[10px] uppercase shadow-none tracking-wide">
                1 Mar - 30 Jun 2026
              </Badge>
              <Badge className="bg-blue-50 hover:bg-blue-50 text-blue-600 border border-blue-100 rounded-xl px-3.5 py-1.5 font-black text-[10px] uppercase shadow-none tracking-wide">
                Zoom · Video · Latihan
              </Badge>
            </div>
          </div>
          <div className="self-end md:self-center">
            <HiOutlineArrowRight className="text-blue-600 text-xl font-bold" />
          </div>
        </div>

        {/* Self Enrolment Section */}
        <div className="border-t border-gray-100 pt-6 mt-6">
          <div className="flex items-center gap-2 text-blue-600 font-black text-base mb-6 select-none">
            <HiOutlineChevronDown className="text-lg" />
            <span>Self enrolment (Peserta)</span>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-700 text-sm font-bold mb-6">
              Tidak memerlukan enrolment key.
            </p>

            <Button 
              onClick={handleEnrollAction}
              disabled={isEnrolling}
              className="bg-[#1d75d3] hover:bg-[#155fae] text-white font-black px-12 py-6 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-100 hover:shadow-lg transition-all"
            >
              {isEnrolling ? 'Memproses...' : 'Enrol me'}
            </Button>

            <p className="text-gray-400 text-xs mt-6 font-bold uppercase tracking-wider">
              Setelah terdaftar, kamu langsung masuk ke List {course.jumlahPertemuan || 3} Pertemuan.
            </p>
          </div>
        </div>
      </div>
      <Dialog open={isEnrollModalOpen} onOpenChange={(open) => {
        setIsEnrollModalOpen(open);
        if (!open) {
          setPaymentStep('details');
          setReferralInput("");
          setCopiedVA(false);
        }
      }}>
        <DialogContent className={`rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white transition-all duration-300 text-left ${paymentStep === 'success' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}>
          {/* Header Banner */}
          {paymentStep === 'success' ? (
            <div className="bg-[#0fa44a] px-6 py-6 text-white flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0fa44a] shrink-0 shadow-sm">
                <HiOutlineCheck className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black tracking-wide leading-tight text-white">Pembayaran Berhasil</h2>
                <p className="text-[11px] text-white/95 font-bold mt-1 leading-snug">
                  Kursus <strong className="font-black text-white">{course.nama}</strong> sudah aktif di akun kamu.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1d75d3] px-6 py-5 text-white text-left">
              <h2 className="text-lg font-black tracking-wide leading-none">
                {paymentStep === 'details' ? 'Enroll Kursus' : paymentStep === 'simulate' ? 'Simulasi Pembayaran' : 'Pembayaran Sukses'}
              </h2>
              <p className="text-xs text-blue-100 font-bold mt-2 tracking-wide uppercase">
                {course.nama}
              </p>
            </div>
          )}

          {paymentStep === 'details' ? (
            /* Step 1: Details & Bank Selection */
            <div className="p-6 space-y-6">
              {(() => {
                const priceNum = parseInt(course.warna?.replace(/[^0-9]/g, '') || '0', 10);
                const hasReferral = referralInput.trim().length > 0;
                const discountAmount = hasReferral ? Math.round(priceNum * 0.1) : 0;
                const finalPrice = priceNum - discountAmount;

                return (
                  <div className="border border-gray-150 rounded-2xl bg-gray-50 overflow-hidden divide-y divide-gray-150/60">
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Harga kursus</span>
                      <span className="text-sm font-black text-gray-800">
                        {priceInfo.current}
                      </span>
                    </div>
                    {hasReferral && (
                      <div className="flex justify-between items-center px-5 py-3 bg-emerald-50/50">
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                          <HiOutlineSparkles className="w-3.5 h-3.5" /> Diskon Referral (10%)
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          - Rp {discountAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-5 py-4 bg-gray-50/50">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total bayar</span>
                      <span className="text-base font-black text-red-500">
                        Rp {finalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Referral Code input */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <HiOutlineTag className="text-sm text-gray-400 shrink-0" />
                  <span>Kode Referral</span>
                </div>
                <input 
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  placeholder="Masukkan kode referral jika ada"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-bold text-gray-800 placeholder-gray-400 transition-all shadow-inner"
                />
                <p className="text-[10px] text-gray-400 font-bold">
                  * Gunakan kode referral untuk mendapatkan diskon 10%
                </p>
              </div>

              {/* Bank Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <HiOutlineCreditCard className="text-sm text-gray-400 shrink-0" />
                  <span>Pilih Bank Virtual Account</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(['Mandiri', 'BCA', 'BRI'] as const).map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`py-3 px-4 rounded-xl border text-xs font-black uppercase tracking-wider transition-all flex flex-col items-center justify-center gap-1 ${
                        selectedBank === bank
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-gray-400">VA</span>
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Waktu */}
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                <HiOutlineClock className="text-xs text-gray-400 shrink-0" />
                <span>Waktu pendaftaran akan dicatat: {new Date().toLocaleTimeString('id-ID')}</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="flex-1 py-6 bg-gray-100 hover:bg-gray-200 border-none text-gray-700 font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // Generate VA code
                    const bankPrefix = selectedBank === 'Mandiri' ? '88008' : selectedBank === 'BCA' ? '3901' : '126';
                    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
                    setGeneratedVA(bankPrefix + randomDigits);
                    setGeneratedInvoice(`INV/MK/${Date.now()}`);
                    setPaymentStep('simulate');
                  }}
                  className="flex-1 py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all"
                >
                  Lanjutkan
                </Button>
              </div>
            </div>
          ) : paymentStep === 'simulate' ? (
            /* Step 2: Payment Simulation */
            <div className="p-6 space-y-6 text-left">
              {/* Simulation Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <HiOutlineInformationCircle className="text-amber-500 text-lg shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">Mode Simulasi Pembayaran</h4>
                  <p className="text-[10px] text-amber-700 font-semibold mt-1 leading-relaxed">
                    Salin nomor Virtual Account di bawah untuk melakukan simulasi transfer bank. Klik tombol konfirmasi untuk menyelesaikan pendaftaran secara instan.
                  </p>
                </div>
              </div>

              {/* VA & Invoice Details */}
              <div className="border border-gray-150 rounded-2xl bg-gray-50 overflow-hidden divide-y divide-gray-150/60 text-xs">
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="font-bold text-gray-450 uppercase tracking-wider text-[10px]">No. Invoice</span>
                  <span className="font-mono font-bold text-gray-700">{generatedInvoice}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3">
                  <span className="font-bold text-gray-450 uppercase tracking-wider text-[10px]">Metode Pembayaran</span>
                  <span className="font-black text-gray-800 uppercase tracking-wide">{selectedBank} Virtual Account</span>
                </div>
                <div className="flex justify-between items-center px-5 py-4 bg-white">
                  <span className="font-bold text-gray-450 uppercase tracking-wider text-[10px]">Virtual Account</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-blue-600 text-sm tracking-wider">{generatedVA}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedVA);
                        setCopiedVA(true);
                        setTimeout(() => setCopiedVA(false), 2000);
                      }}
                      className="h-7 px-2 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-100"
                    >
                      {copiedVA ? (
                        <>
                          <HiOutlineCheck className="w-3 h-3 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineClipboard className="w-3 h-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center px-5 py-4">
                  <span className="font-bold text-gray-450 uppercase tracking-wider text-[10px]">Total Tagihan</span>
                  <span className="font-black text-red-500 text-sm">
                    {(() => {
                      const priceNum = parseInt(course.warna?.replace(/[^0-9]/g, '') || '0', 10);
                      const hasReferral = referralInput.trim().length > 0;
                      const discountAmount = hasReferral ? Math.round(priceNum * 0.1) : 0;
                      const finalPrice = priceNum - discountAmount;
                      return `Rp ${finalPrice.toLocaleString('id-ID')}`;
                    })()}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse"></span>
                <span>Menunggu Pembayaran</span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentStep('details')}
                  className="flex-1 py-6 bg-gray-100 hover:bg-gray-200 border-none text-gray-700 font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Kembali
                </Button>
                <Button
                  type="button"
                  disabled={isEnrolling}
                  onClick={async () => {
                    const priceNum = parseInt(course.warna?.replace(/[^0-9]/g, '') || '0', 10);
                    const hasReferral = referralInput.trim().length > 0;
                    const discountAmount = hasReferral ? Math.round(priceNum * 0.1) : 0;
                    const finalPrice = priceNum - discountAmount;
                    
                    await performEnrollment(
                      course.id, 
                      finalPrice.toString(),
                      referralInput.trim() || undefined,
                      generatedInvoice,
                      `${selectedBank} Virtual Account`
                    );
                  }}
                  className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  {isEnrolling ? 'Memproses...' : (
                    <>
                      <HiOutlineCheckCircle className="text-base" />
                      <span>Simulasikan Bayar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Step 3: Success Screen */
            <div className="p-6 space-y-6 text-left">
              {/* Transaction Receipt */}
              <div className="border border-gray-150 rounded-2xl bg-gray-50/40 overflow-hidden divide-y divide-gray-150/60 text-xs">
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">No. Invoice</span>
                  <span className="font-mono font-black text-gray-800">{generatedInvoice}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">Metode Pembayaran</span>
                  <span className="font-black text-gray-800 uppercase tracking-wide">{selectedBank} Virtual Account</span>
                </div>
                <div className="flex justify-between items-center px-5 py-3.5">
                  <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">Waktu Aktivasi</span>
                  <span className="font-black text-gray-800">{getActivationTime()}</span>
                </div>
                <div className="flex justify-between items-center px-5 py-4 bg-white">
                  <span className="font-black text-gray-400 uppercase tracking-widest text-[9px]">Total Dibayar</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider">
                      Lunas
                    </span>
                    <span className="font-black text-gray-900 text-sm">
                      {(() => {
                        const priceNum = parseInt(course.warna?.replace(/[^0-9]/g, '') || '0', 10);
                        const hasReferral = referralInput.trim().length > 0;
                        const discountAmount = hasReferral ? Math.round(priceNum * 0.1) : 0;
                        const finalPrice = priceNum - discountAmount;
                        return `Rp ${finalPrice.toLocaleString('id-ID')}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Access Section */}
              <div className="space-y-3">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Akses Yang Kamu Dapat
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-gray-150 bg-gray-50/20 rounded-2xl p-4">
                    <span className="text-xl font-black text-blue-600 block mb-1">
                      {course.jumlahPertemuan || 12}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold leading-tight block">
                      modul terbuka penuh
                    </span>
                  </div>
                  <div className="border border-gray-150 bg-gray-50/20 rounded-2xl p-4">
                    <span className="text-xl font-black text-blue-600 block mb-1">
                      ∞
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold leading-tight block">
                      akses tanpa batas waktu
                    </span>
                  </div>
                  <div className="border border-gray-150 bg-gray-50/20 rounded-2xl p-4">
                    <span className="text-xl font-black text-blue-600 block mb-1">
                      1
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold leading-tight block">
                      sertifikat saat lulus
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEnrollModalOpen(false);
                    setPaymentStep('details');
                    navigate(`/user/detail-kursus?id=${course.id}`);
                  }}
                  className="flex-[2.5] py-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-md shadow-blue-200 transition-all"
                >
                  Mulai Belajar Sekarang
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setIsEnrollModalOpen(false);
                    setPaymentStep('details');
                    navigate('/user/dashboard');
                  }}
                  className="flex-[1.5] py-6 bg-gray-100 hover:bg-gray-250 border-none text-gray-700 font-black rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all"
                >
                  Lihat Kursus Saya
                </Button>
              </div>

              {/* Footer Text */}
              <p className="text-[9px] text-gray-400 font-bold leading-relaxed text-center">
                Invoice sudah dikirim ke {user?.email || 'budi.santoso@email.com'}. Bisa diunduh kapan saja di menu Hasil & Sertifikat.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrolmentOptions;

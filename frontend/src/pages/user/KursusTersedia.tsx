import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HiOutlineClock, 
  HiOutlineBookOpen, 
  HiOutlineUsers, 
  HiOutlineArrowRight, 
  HiOutlineCheckCircle, 
  HiOutlineSparkles,
  HiOutlineTrophy,
  HiOutlineInformationCircle,
  HiOutlineCheck,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlineClipboard,
  HiOutlineCreditCard,
  HiOutlineDocumentText
} from 'react-icons/hi2';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { useAuthStore } from '../../store/useAuthStore';
import { usePaketStore } from '../../store/usePaketStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from '../../lib/api';

// Helper to format course release dates
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Feb 2025';
  }
};

// Helper to format course prices and old crossed-out prices
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

const getFormattedCurrentTime = () => {
  const now = new Date();
  const day = now.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}.${minutes}.${seconds}`;
};

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
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60'; // Node/API/default
};

// Helper to resolve path prefix
const getPathPrefix = (pathName: string) => {
  const norm = pathName.toLowerCase();
  if (norm.includes('science')) return 'DS';
  if (norm.includes('security') || norm.includes('cyber')) return 'CS';
  if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) return 'UI';
  if (norm.includes('ai') || norm.includes('intelligence')) return 'AI';
  return 'WD';
};

// Helper matching mockup courses if database is empty
const getMockNodes = (path: string = 'Web Development') => {
  const normPath = path.toLowerCase();
  
  if (normPath.includes('science')) {
    // Data Science
    return [
      { id: 'mock-ds-1', kode: 'DS-01', nama: 'Python untuk Data Science', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 3, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-2', kode: 'DS-02', nama: 'Statistika Deskriptif', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 3, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-3', kode: 'DS-03', nama: 'Data Wrangling & SQL', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-4', kode: 'DS-04', nama: 'Analisis Data & Visualisasi', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-5', kode: 'DS-05', nama: 'Pengantar Machine Learning', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-6', kode: 'DS-06', nama: 'Capstone Data Science', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 3, _count: { pendaftaran: 142 } }
    ];
  } else if (normPath.includes('security') || normPath.includes('cyber')) {
    // Cyber Security
    return [
      { id: 'mock-cs-1', kode: 'CS-01', nama: 'Keamanan Jaringan Komputer', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 3, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-2', kode: 'CS-02', nama: 'Pengantar Kriptografi', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 3, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-3', kode: 'CS-03', nama: 'Ethical Hacking & Pentesting', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-4', kode: 'CS-04', nama: 'Analisis Forensik Digital', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-5', kode: 'CS-05', nama: 'Audit Keamanan Informasi', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-6', kode: 'CS-06', nama: 'Cyber Defense Capstone', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 3, _count: { pendaftaran: 98 } }
    ];
  } else if (normPath.includes('ui') || normPath.includes('ux') || normPath.includes('design')) {
    // UI/UX Design
    return [
      { id: 'mock-ui-1', kode: 'UI-01', nama: 'Fundamental Desain Grafis', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 3, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-2', kode: 'UI-02', nama: 'Pengantar UI/UX & Figma', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 3, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-3', kode: 'UI-03', nama: 'Riset Pengguna & Persona', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-4', kode: 'UI-04', nama: 'Wireframing & Prototyping', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-5', kode: 'UI-05', nama: 'Usability Testing', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-6', kode: 'UI-06', nama: 'UI/UX Capstone Portfolio', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 3, _count: { pendaftaran: 215 } }
    ];
  } else if (normPath.includes('ai') || normPath.includes('intelligence')) {
    // AI Fundamentals
    return [
      { id: 'mock-ai-1', kode: 'AI-01', nama: 'Pengantar Kecerdasan Buatan', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 3, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-2', kode: 'AI-02', nama: 'Aljabar Linier untuk AI', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 3, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-3', kode: 'AI-03', nama: 'Pemrograman Python & ML', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-4', kode: 'AI-04', nama: 'Deep Learning Basics', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-5', kode: 'AI-05', nama: 'Natural Language Processing', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-6', kode: 'AI-06', nama: 'AI Capstone Project', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 3, _count: { pendaftaran: 180 } }
    ];
  } else {
    // Default Web Development
    return [
      { id: 'mock-1', kode: 'WD-01', nama: 'HTML & CSS Dasar', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 3, _count: { pendaftaran: 248 } },
      { id: 'mock-2', kode: 'WD-02', nama: 'JavaScript Dasar', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 3, _count: { pendaftaran: 248 } },
      { id: 'mock-3', kode: 'WD-03', nama: 'React JS Fundamental', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 248 } },
      { id: 'mock-4', kode: 'WD-04', nama: 'Node.js & API dev', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 248 } },
      { id: 'mock-5', kode: 'WD-05', nama: 'Database & ORM', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 3, _count: { pendaftaran: 248 } },
      { id: 'mock-6', kode: 'WD-06', nama: 'Full Stack Capstone', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 3, _count: { pendaftaran: 248 } }
    ];
  }
};

interface PathStep {
  name: string;
  exists: boolean;
  enrolled: boolean;
  active: boolean;
  course?: any;
  trophy?: boolean;
}

const KursusTersedia: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { publishedMataKuliahList, fetchPublishedMataKuliah, mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus, referralList, fetchMyReferrals } = usePendaftaranStore();
  const { paketList: dbPaketList, fetchPaket } = usePaketStore();
  const { user } = useAuthStore();
  const activePath = user?.pelatihan || 'Web Development';

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Free' | 'Berbayar' | 'Course map' | 'Referall'>('Semua');
  const [courseMapMode, setCourseMapMode] = useState<'individual' | 'paket'>('individual');
  const [progressData, setProgressData] = useState<any[]>([]);
  const [selectedPaketId, setSelectedPaketId] = useState<string>('');

  useEffect(() => {
    if (dbPaketList && dbPaketList.length > 0 && !selectedPaketId) {
      setSelectedPaketId(dbPaketList[0].id);
    }
  }, [dbPaketList, selectedPaketId]);

  // Enrollment & Payment Simulation Modal States
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseToEnroll, setSelectedCourseToEnroll] = useState<any | null>(null);
  const [referralInput, setReferralInput] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Payment Simulation States
  const [paymentStep, setPaymentStep] = useState<'details' | 'simulate' | 'success'>('details');
  const [selectedBank, setSelectedBank] = useState<'Mandiri' | 'BCA' | 'BRI'>('Mandiri');
  const [generatedVA, setGeneratedVA] = useState("");
  const [generatedInvoice, setGeneratedInvoice] = useState("");
  const [copiedVA, setCopiedVA] = useState(false);

  // Referral State Variables
  const [referralActiveTab, setReferralActiveTab] = useState<'referral' | 'pembayaran'>('referral');
  const [copied, setCopied] = useState(false);
  const [deletedReferralIds, setDeletedReferralIds] = useState<string[]>([]);
  const [deletedPaymentIds, setDeletedPaymentIds] = useState<string[]>([]);

  // Tab Param Parser
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'referral') {
      setActiveFilter('Referall');
    }
  }, [location]);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/student/status/progres');
      setProgressData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch student progress', error);
    }
  };

  useEffect(() => {
    fetchPublishedMataKuliah();
    fetchMataKuliah();
    fetchMyPendaftaran();
    fetchProgress();
    fetchPaket();
  }, [fetchPublishedMataKuliah, fetchMataKuliah, fetchMyPendaftaran, fetchPaket]);

  useEffect(() => {
    if (activeFilter === 'Referall') {
      fetchMyReferrals();
      fetchMyPendaftaran();
    }
  }, [activeFilter, fetchMyReferrals, fetchMyPendaftaran]);

  const handleEnroll = async (id: string, referralCode?: string, customPrice?: string, customInvoice?: string, customMethod?: string) => {
    const course = publishedMataKuliahList.find(c => c.id === id);
    const priceDisplay = course ? getPriceDisplay(course.warna).current : 'Gratis';
    let cleanPrice = customPrice !== undefined ? customPrice : (priceDisplay === 'Gratis' ? '0' : priceDisplay.replace(/[^0-9]/g, ''));

    if (referralCode && cleanPrice !== '0' && customPrice === undefined) {
      // Apply 10% discount
      const discountAmount = Math.round(parseInt(cleanPrice, 10) * 0.1);
      cleanPrice = (parseInt(cleanPrice, 10) - discountAmount).toString();
    }

    try {
      setIsEnrolling(true);
      await enrollKursus(id, {
        referralCode: referralCode || undefined,
        harga: cleanPrice,
        invoiceNo: customInvoice || `INV/MK/${Date.now()}`,
        method: customMethod || 'Mandiri Virtual Account',
        status: 'Lunas'
      });
      await fetchMyPendaftaran();
      await fetchProgress();
      
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

  const handleBeliPaket = async (paketNama: string, targetCodes: string[]) => {
    if (!window.confirm(`Apakah Anda yakin ingin membeli paket "${paketNama}"? Anda akan otomatis terdaftar ke semua kelas dalam paket ini.`)) {
      return;
    }

    const coursesToEnroll = publishedMataKuliahList.filter(c => 
      targetCodes.some(code => c.kode?.toLowerCase().includes(code.toLowerCase()))
    );

    if (coursesToEnroll.length === 0) {
      alert('Maaf, kelas-kelas di dalam paket ini belum dipublikasikan oleh admin.');
      return;
    }

    let enrolledCount = 0;
    let alreadyEnrolledCount = 0;

    let splitPrice = '0';
    if (paketNama === 'Web Dev Full Path') splitPrice = '199800';
    else if (paketNama === 'Front-End Specialist') splitPrice = '174750';
    else if (paketNama === 'Back-End Engineer') splitPrice = '199666';

    try {
      for (const course of coursesToEnroll) {
        const isAlreadyEnrolled = pendaftaranList.some(p => p.mataKuliahId === course.id);
        if (isAlreadyEnrolled) {
          alreadyEnrolledCount++;
        } else {
          await enrollKursus(course.id, {
            harga: splitPrice,
            invoiceNo: `INV/PK/${Date.now()}`,
            method: 'Mandiri Virtual Account',
            status: 'Lunas'
          });
          enrolledCount++;
        }
      }
      
      await fetchMyPendaftaran();
      await fetchProgress();

      if (enrolledCount > 0) {
        alert(`Selamat! Anda berhasil membeli paket "${paketNama}" dan didaftarkan ke ${enrolledCount} kelas baru!`);
      } else if (alreadyEnrolledCount > 0) {
        alert(`Anda sudah terdaftar di semua kelas yang ada di dalam paket "${paketNama}".`);
      }
    } catch (err) {
      console.error('Failed to purchase package courses:', err);
      alert('Gagal memproses pendaftaran beberapa kelas pada paket.');
    }
  };

  // Filter courses based on selected filter
  const filteredCourses = publishedMataKuliahList.filter(mk => {
    if (activeFilter === 'Semua') return true;
    const priceInfo = getPriceDisplay(mk.warna);
    if (activeFilter === 'Free') return priceInfo.current === 'Gratis';
    if (activeFilter === 'Berbayar') return priceInfo.current !== 'Gratis';
    if (activeFilter === 'Course map') return !!mk.level;
    return true;
  });

  // Group by level with fallback to Beginner for anything that is not intermediate or advanced
  const beginnerCourses = filteredCourses.filter(c => {
    const lvl = (c.level || '').toLowerCase();
    return lvl === 'beginner' || (lvl !== 'intermediate' && lvl !== 'advanced' && lvl !== 'advance');
  });
  const intermediateCourses = filteredCourses.filter(c => c.level?.toLowerCase() === 'intermediate');
  const advancedCourses = filteredCourses.filter(c => c.level?.toLowerCase() === 'advanced' || c.level?.toLowerCase() === 'advance');

  // Dynamic mapping of top path steps using real database courses or mock fallback
  const getPathStepStatus = (keywords: string[], codePatterns: string[], pathName: string) => {
    const prefix = getPathPrefix(pathName);
    const hasRealCourses = publishedMataKuliahList.some(c => c.kode?.toUpperCase().startsWith(prefix));

    if (hasRealCourses) {
      const course = publishedMataKuliahList.find(c => 
        codePatterns.some(pat => c.kode.toLowerCase().includes(pat.toLowerCase())) || 
        keywords.some(kw => c.nama.toLowerCase().includes(kw.toLowerCase())) ||
        (c.deskripsi && keywords.some(kw => c.deskripsi!.toLowerCase().includes(kw.toLowerCase())))
      );
      if (!course) return { exists: false, enrolled: false, active: false };
      
      const enrolled = pendaftaranList.some(p => p.mataKuliahId === course.id);
      
      // Active if enrolled or if prerequisites are met
      const prereqsMet = course.prerequisites?.every((pr: any) => 
        pendaftaranList.some(p => p.mataKuliahId === (typeof pr === 'object' ? pr.id : pr))
      ) ?? true;

      return { exists: true, enrolled, active: enrolled || prereqsMet, course };
    } else {
      // Mock fallback: search in getMockNodes
      const mocks = getMockNodes(pathName);
      const mockCourse = mocks.find(c => 
        codePatterns.some(pat => c.kode.toLowerCase().includes(pat.toLowerCase())) || 
        keywords.some(kw => c.nama.toLowerCase().includes(kw.toLowerCase()))
      );
      if (!mockCourse) return { exists: false, enrolled: false, active: false };

      // Simulate enrollment status: mock courses ending in 1, 2, 3 are enrolled, 4 is active
      const mockId = mockCourse.id;
      const isEnrolled = mockId.endsWith('1') || mockId.endsWith('2') || mockId.endsWith('3');
      const isActive = isEnrolled || mockId.endsWith('4');

      return { exists: true, enrolled: isEnrolled, active: isActive, course: mockCourse };
    }
  };

  const getDynamicPathSteps = (path: string): PathStep[] => {
    const norm = path.toLowerCase();
    if (norm.includes('science')) {
      return [
        { name: 'Python DS', ...getPathStepStatus(['python', 'science'], ['ds-01'], path) },
        { name: 'Statistika', ...getPathStepStatus(['statistika', 'deskriptif'], ['ds-02'], path) },
        { name: 'SQL & Wrangling', ...getPathStepStatus(['wrangling', 'sql'], ['ds-03'], path) },
        { name: 'Analysis & Viz', ...getPathStepStatus(['analisis', 'visualisasi'], ['ds-04'], path) },
        { name: 'Machine Learning', ...getPathStepStatus(['machine learning', 'ml'], ['ds-05'], path), trophy: true }
      ];
    }
    if (norm.includes('security') || norm.includes('cyber')) {
      return [
        { name: 'Network Sec', ...getPathStepStatus(['jaringan', 'keamanan'], ['cs-01'], path) },
        { name: 'Kriptografi', ...getPathStepStatus(['kriptografi'], ['cs-02'], path) },
        { name: 'Ethical Hacking', ...getPathStepStatus(['hacking', 'pentesting'], ['cs-03'], path) },
        { name: 'Forensics', ...getPathStepStatus(['forensik'], ['cs-04'], path) },
        { name: 'Security Audit', ...getPathStepStatus(['audit', 'keamanan'], ['cs-05'], path), trophy: true }
      ];
    }
    if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) {
      return [
        { name: 'Graphic Design', ...getPathStepStatus(['grafis', 'desain'], ['ui-01'], path) },
        { name: 'Figma Basics', ...getPathStepStatus(['figma', 'ui/ux'], ['ui-02'], path) },
        { name: 'User Research', ...getPathStepStatus(['riset', 'persona'], ['ui-03'], path) },
        { name: 'Wireframing', ...getPathStepStatus(['wireframing', 'prototyping'], ['ui-04'], path) },
        { name: 'Usability Testing', ...getPathStepStatus(['usability', 'testing'], ['ui-05'], path), trophy: true }
      ];
    }
    if (norm.includes('ai') || norm.includes('intelligence')) {
      return [
        { name: 'Intro to AI', ...getPathStepStatus(['artificial', 'kecerdasan'], ['ai-01'], path) },
        { name: 'Math for AI', ...getPathStepStatus(['aljabar', 'matematika'], ['ai-02'], path) },
        { name: 'Python ML', ...getPathStepStatus(['pemrograman', 'ml'], ['ai-03'], path) },
        { name: 'Deep Learning', ...getPathStepStatus(['deep learning'], ['ai-04'], path) },
        { name: 'NLP / GenAI', ...getPathStepStatus(['nlp', 'language'], ['ai-05'], path), trophy: true }
      ];
    }
    return [
      { name: 'HTML & CSS', ...getPathStepStatus(['html', 'css', 'dasar'], ['wd-01', 'mk001'], path) },
      { name: 'JavaScript', ...getPathStepStatus(['javascript', 'js'], ['wd-02', 'mk002'], path) },
      { name: 'React JS', ...getPathStepStatus(['react'], ['wd-03', 'mk003'], path) },
      { name: 'Node.js & API', ...getPathStepStatus(['node', 'api', 'backend'], ['wd-04', 'mk004'], path) },
      { name: 'Full Stack Project', ...getPathStepStatus(['full stack', 'capstone', 'project'], ['wd-05', 'mk005'], path), trophy: true }
    ];
  };

  const pathSteps = getDynamicPathSteps(activePath);

  const getCourseProgress = (courseId: string, totalPertemuan: number) => {
    const completedSessions = progressData.filter(
      (prog) => prog.pertemuan?.mataKuliahId === courseId && prog.isCompleted
    ).length;
    const total = totalPertemuan || 14;
    return total > 0 ? Math.min(Math.round((completedSessions / total) * 100), 100) : 0;
  };

  const renderCourseCard = (course: any) => {
    const isRegistered = pendaftaranList.some(p => p.mataKuliahId === course.id);

    // Prerequisite check: locked if any prereq is not registered
    const isPrereqsMet = course.prerequisites?.every((pr: any) => {
      const prereqId = typeof pr === 'object' ? pr.id : pr;
      return pendaftaranList.some(p => p.mataKuliahId === prereqId);
    }) ?? true;

    const isLocked = !isPrereqsMet;
    const priceInfo = getPriceDisplay(course.warna);
    const participantCount = Math.max(course._count?.pendaftaran || 0, isRegistered ? 1 : 0);

    // Format prerequisite display codes text
    const prereqListText = course.prerequisites && course.prerequisites.length > 0
      ? course.prerequisites.map((p: any) => p.kode || 'WD').join(' + ')
      : '';

    return (
      <Card 
        key={course.id}
        className={`rounded-[2.2rem] border border-gray-150 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col relative ${
          isLocked ? 'opacity-90' : ''
        }`}
        onClick={() => {
          if (isLocked) return;
          if (isRegistered) {
            navigate(`/user/detail-kursus?id=${course.id}`);
          } else {
            navigate(`/user/enrolment-options?id=${course.id}`);
          }
        }}
      >
        {/* Top Image Cover */}
        <div className="h-44 relative overflow-hidden shrink-0">
          <img 
            src={getCourseImageUrl(course.kode)}
            alt={course.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/25"></div>

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex gap-2 items-center">
            <Badge className="bg-sky-500/20 backdrop-blur-md text-sky-200 border border-sky-400/20 font-black text-[9px] px-3.5 py-0.5 rounded-full uppercase tracking-wider">
              {course.level || 'Beginner'}
            </Badge>
            <Badge className="bg-gray-800/60 backdrop-blur-md text-gray-200 border border-gray-700/20 font-black text-[9px] px-3.5 py-0.5 rounded-full">
              {course.kode}
            </Badge>
          </div>

          {/* Special status like Segera */}
          {isLocked && (
            <Badge className="absolute top-4 right-4 bg-gray-500/80 text-white font-black text-[9px] px-3 py-0.5 rounded-full uppercase">
              Terkunci
            </Badge>
          )}

          {/* Date Badge Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <HiOutlineClock className="w-3.5 h-3.5 text-white" />
            Rilis: {formatDate(course.createdAt)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
              {course.nama}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-5">
              {course.deskripsi || 'Pelajari materi ini untuk meningkatkan keahlian Anda secara komprehensif.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Sesi & Peserta details */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                <HiOutlineBookOpen className="text-sm shrink-0" />
                <span>{course.jumlahPertemuan || course._count?.pertemuan || 3} Sesi</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                <HiOutlineUsers className="text-sm shrink-0" />
                <span>{participantCount} Siswa</span>
              </div>
              {isRegistered && (
                <span className="text-[10px] font-black text-emerald-600 uppercase ml-auto">
                  Active
                </span>
              )}
            </div>

            {/* Registered Progress Bar */}
            {isRegistered && (
              <div className="pt-2 border-t border-gray-50">
                <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase mb-1">
                  <span>Progres belajar</span>
                  <span>{getCourseProgress(course.id, course.jumlahPertemuan || course._count?.pertemuan || 3)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full transition-all duration-500" style={{ width: `${getCourseProgress(course.id, course.jumlahPertemuan || course._count?.pertemuan || 3)}%` }}></div>
                </div>
              </div>
            )}

            {/* Prerequisites Lock Warning Banner */}
            {!isRegistered && prereqListText && (
              <div className="bg-gray-100 rounded-xl px-3.5 py-2 flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-2">
                <span className="text-xs">💡</span>
                <span>Lulus {prereqListText} ({course.prerequisites[0]?.nama || 'Sebelumnya'})</span>
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-white shadow-sm flex items-center justify-center font-black text-[#5850ec] text-[9px] uppercase shrink-0">
                  {((course.pengajar?.nama || 'AS').split(' ').map((n: string) => n[0]).join('').substring(0, 2))}
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-900 leading-none">{course.pengajar?.nama || 'Ahmad Subarjo'}</p>
                  <p className="text-[7px] font-black text-gray-400 uppercase mt-0.5 tracking-wider leading-none">Pengajar</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Price Display */}
                <div className="text-right flex flex-col justify-center">
                  {priceInfo.old && (
                    <span className="text-[8px] font-black text-red-500 line-through leading-none block mb-0.5">
                      {priceInfo.old}
                    </span>
                  )}
                  <span className={`text-[10px] font-black leading-none block ${
                    priceInfo.current === 'Gratis' ? 'text-[#10b981]' : 'text-blue-600'
                  }`}>
                    {priceInfo.current}
                  </span>
                </div>

                {isRegistered ? (
                  <div className="flex items-center gap-1 text-[#10b981] font-black text-[9px] uppercase tracking-wider bg-emerald-50 px-3 py-2 rounded-xl">
                    <HiOutlineCheckCircle className="text-sm shrink-0" /> Active
                  </div>
                ) : isLocked ? (
                  <Button 
                    disabled
                    className="bg-gray-200 text-gray-400 font-black rounded-xl text-[9px] h-8 px-4 border-none shadow-none uppercase tracking-wider cursor-not-allowed"
                  >
                    Terkunci
                  </Button>
                ) : (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const priceInfo = getPriceDisplay(course.warna);
                      const isPaid = priceInfo.current !== 'Gratis';
                      if (isPaid) {
                        setSelectedCourseToEnroll(course);
                        setReferralInput("");
                        setIsEnrollModalOpen(true);
                      } else {
                        handleEnroll(course.id);
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] h-8 px-4 shadow-sm uppercase tracking-wider flex items-center gap-1"
                  >
                    Enroll <HiOutlineArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderLevelSection = (levelTitle: string, courses: any[], textColorClass: string) => {
    if (courses.length === 0) return null;
    return (
      <div className="mb-10 text-left">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
          <HiOutlineSparkles className={`text-base shrink-0 ${textColorClass}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${textColorClass}`}>
            {levelTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map(course => renderCourseCard(course))}
        </div>
      </div>
    );
  };

  // Mock nodes removed (defined in outer scope)

  const renderUserCourseCard = (course: any) => {
    const isRegistered = course.id.startsWith('mock-') 
      ? (course.id.endsWith('1') || course.id.endsWith('2') || course.id.endsWith('3'))
      : pendaftaranList.some(p => p.mataKuliahId === course.id);

    const isPrereqsMet = course.prerequisites?.every((pr: any) => {
      const prereqId = typeof pr === 'object' ? pr.id : pr;
      return pendaftaranList.some(p => p.mataKuliahId === prereqId);
    }) ?? true;

    const isLocked = course.id.startsWith('mock-')
      ? (course.id.endsWith('4') || course.id.endsWith('5') || course.id.endsWith('6'))
      : (!isPrereqsMet || !course.published);

    const priceInfo = getPriceDisplay(course.warna);
    const meetingsText = `${course.jumlahPertemuan || 3} Sesi`;

    // Footer bar styling based on status
    let footerBg = 'bg-[#76b900] text-white'; // NVIDIA Green style by default
    let footerText = `${meetingsText} | Enroll`;

    if (isRegistered) {
      footerBg = 'bg-[#10b981] text-white'; // Emerald Green for active
      footerText = 'AKTIF / TERDAFTAR';
    } else if (isLocked) {
      footerBg = 'bg-gray-400 text-white'; // Grey for locked
      footerText = 'TERKUNCI';
    } else {
      // Determine green or purple accent based on price/warna
      const cleanPrice = (course.warna || '').replace(/[^0-9]/g, '');
      const numPrice = parseInt(cleanPrice, 10);
      if (!isNaN(numPrice) && numPrice >= 500000 || (course.warna || '').toLowerCase().includes('500')) {
        footerBg = 'bg-[#7630a3] text-white'; // Purple style for expensive/adv
      }
      footerText = `Daftar | ${priceInfo.current}`;
    }

    return (
      <div
        key={course.id}
        onClick={() => {
          if (course.id.startsWith('mock-')) {
            alert(`Kursus mockup "${course.nama}" belum dibuat di database oleh Admin.`);
            return;
          }
          if (isLocked) return;
          if (isRegistered) {
            navigate(`/user/detail-kursus?id=${course.id}`);
          } else {
            navigate(`/user/enrolment-options?id=${course.id}`);
          }
        }}
        className={`cursor-pointer rounded-xl border border-gray-300 relative transition-all duration-200 hover:scale-[1.02] w-[215px] text-left flex flex-col justify-between overflow-hidden shadow-sm bg-white shrink-0 ${
          isRegistered ? 'ring-4 ring-emerald-500/25 border-emerald-500' : ''
        } ${isLocked ? 'opacity-85 cursor-not-allowed' : ''}`}
      >
        {isRegistered && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold">✓</div>
        )}
        {isLocked && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-sm font-bold">🔒</div>
        )}
        {!isRegistered && !isLocked && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-[#5850ec] text-white rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold">⏳</div>
        )}

        {/* Card Body - Content */}
        <div className="p-4 flex-1 flex flex-col justify-center min-h-[70px] bg-[#f3f4f6]">
          <p className="text-[9px] font-bold text-gray-400 mb-1 text-center tracking-wider">{course.kode}</p>
          <h3 className="text-[11px] font-black text-gray-800 leading-snug text-center line-clamp-2">
            {course.nama}
          </h3>
        </div>

        {/* Card Footer - Solid Color Bar */}
        <div className={`h-8 flex items-center justify-center font-extrabold text-[10px] tracking-wide ${footerBg}`}>
          {footerText}
        </div>
      </div>
    );
  };

  const renderRoadmapTimeline = () => {
    const selectedPaket = dbPaketList.find(p => p.id === selectedPaketId) || dbPaketList[0];

    const displayCourses = (() => {
      if (!selectedPaket || !selectedPaket.courses) {
        return getMockNodes(activePath);
      }
      
      const courseIdsInPaket = new Set(selectedPaket.courses.map((c: any) => c.id));
      const dbCourses = mataKuliahList.filter(c => courseIdsInPaket.has(c.id));
      
      return dbCourses.map(c => ({
        ...c,
        level: c.level || 'Beginner'
      }));
    })();

    const categoriesWithCourses = (() => {
      if (displayCourses.length === 0) return [];

      const courseMap = new Map(displayCourses.map(c => [c.id, c]));
      const depthMemo = new Map<string, number>();

      const getDepth = (courseId: string, visited: Set<string> = new Set()): number => {
        if (depthMemo.has(courseId)) return depthMemo.get(courseId)!;
        if (visited.has(courseId)) return 0; // Avoid circular dependencies
        
        const course = courseMap.get(courseId) as any;
        if (!course) return 0;
        
        visited.add(courseId);
        
        let maxPrereqDepth = -1;
        const prereqs = course.prerequisites || [];
        for (const p of prereqs) {
          const prereqId = typeof p === 'object' ? p.id : p;
          if (courseMap.has(prereqId)) {
            maxPrereqDepth = Math.max(maxPrereqDepth, getDepth(prereqId, new Set(visited)));
          }
        }
        
        const depth = maxPrereqDepth + 1;
        depthMemo.set(courseId, depth);
        return depth;
      };

      // Annotate all courses with depth
      const coursesWithDepth = displayCourses.map(c => ({
        ...c,
        depth: getDepth(c.id)
      }));

      // Group by c.kategori
      const groups: { [key: string]: typeof coursesWithDepth } = {};
      coursesWithDepth.forEach(c => {
        const kat = c.kategori || selectedPaket?.nama || activePath || 'Umum';
        if (!groups[kat]) {
          groups[kat] = [];
        }
        groups[kat].push(c);
      });

      // For each group, structure the courses by depth to draw vertical flows
      return Object.keys(groups).map(kategoriName => {
        const categoryCourses = groups[kategoriName];
        
        // Group categoryCourses by depth
        const depthGroups: { [key: number]: typeof coursesWithDepth } = {};
        categoryCourses.forEach(c => {
          const d = c.depth || 0;
          if (!depthGroups[d]) {
            depthGroups[d] = [];
          }
          depthGroups[d].push(c);
        });

        // Sort the depths inside this category
        const sortedDepths = Object.keys(depthGroups).map(Number).sort((a, b) => a - b);
        
        const flowColumns = sortedDepths.map(depth => ({
          depth,
          courses: depthGroups[depth]
        }));

        return {
          kategoriName,
          flowColumns
        };
      });
    })();

    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 mt-2">
        <div className="mb-8 text-left flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Learning Roadmap</h2>
            <p className="text-xs text-gray-500 font-bold">
              {selectedPaket?.deskripsi || 'Jalur belajar terstruktur untuk menguasai kompetensi secara terarah.'}
            </p>
          </div>
          {dbPaketList && dbPaketList.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Pilih Paket:</span>
              <select
                value={selectedPaketId}
                onChange={(e) => setSelectedPaketId(e.target.value)}
                className="bg-[#f3f4f6] border border-gray-200 text-gray-700 font-black text-[11px] uppercase rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {dbPaketList.map(paket => (
                  <option key={paket.id} value={paket.id}>{paket.nama}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-12">
          {categoriesWithCourses.map((cat) => (
            <div key={cat.kategoriName} className="flex flex-col gap-4 border-b border-gray-100 pb-8 last:border-b-0 last:pb-0 text-left">
              {/* Category Heading */}
              <h3 className="text-sm font-black text-gray-800 tracking-wide uppercase border-b border-gray-100 pb-2">
                {cat.kategoriName}
              </h3>

              {/* Wrapping Horizontal Flow Container (No Scroll) */}
              <div className="flex flex-row flex-wrap py-6 gap-y-8 gap-x-6 w-full justify-center items-center">
                {cat.flowColumns.map((column) => (
                  <React.Fragment key={column.depth}>
                    {/* Column containing courses at this depth (vertical stack if multiple) */}
                    <div className="flex flex-col gap-4 justify-center items-center min-w-[215px]">
                      {column.courses.map((course) => renderUserCourseCard(course))}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {categoriesWithCourses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada kursus dalam paket ini</p>
              <p className="text-xs text-gray-400 font-semibold mt-1">Silakan pilih paket lain.</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 bg-white py-3.5 px-6 rounded-2xl border border-gray-150 shadow-sm max-w-lg mx-auto flex flex-wrap items-center justify-center gap-6">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status Kelas:</span>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span>Aktif / Terdaftar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76b900]"></span>
              <span>Dapat Didaftar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
              <span>Terkunci</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPaketSection = () => {
    return (
      <div className="mt-2 text-left">
        {/* Info Alert Box */}
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] px-4 py-3.5 rounded-xl flex items-center gap-2 mb-8 shadow-sm text-sm">
          <HiOutlineInformationCircle className="w-5 h-5 shrink-0 text-[#16a34a]" />
          <span>Beli paket lebih hemat dibanding beli kursus satuan. Paket sudah termasuk semua kursus dalam bundle.</span>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(dbPaketList || []).map((paket) => {
            const isAllEnrolled = (paket.courses || []).every((c: any) =>
              pendaftaranList.some(p => p.mataKuliahId === c.id)
            );

            const tags = (paket.courses || []).map((c: any) => {
              const nameParts = c.nama.split(' ');
              return nameParts[0] + (nameParts[1] ? ' ' + nameParts[1].substring(0, 1) : '');
            }).slice(0, 5);

            const isPopular = paket.nama.toLowerCase().includes('full path');

            return (
              <div 
                key={paket.id}
                className={`relative bg-[#133c66] text-white p-8 rounded-[2rem] border-2 shadow-xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 min-h-[520px] ${
                  isPopular ? 'border-blue-500' : 'border-slate-700 bg-[#0e2c4c]'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#38bdf8] text-[#0f2a47] font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    Paling Populer
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black mb-1">{paket.nama}</h3>
                  <p className="text-xs font-bold text-sky-200/70 mb-5">{paket.courses?.length || 0} kursus lengkap</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span key={idx} className="bg-white/10 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3.5 my-8">
                    {[
                      paket.deskripsi || 'Akses selamanya ke semua kursus',
                      'Sertifikat resmi per kursus',
                      'Komunitas eksklusif',
                      '1-on-1 mentoring session'
                    ].slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-sky-100/90 font-semibold">
                        <span className="w-4 h-4 rounded-full bg-sky-500/20 text-[#38bdf8] flex items-center justify-center text-[10px] shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & Buy Button */}
                <div className="mt-auto border-t border-white/10 pt-6">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black">
                      Rp {parseInt(paket.hargaPaket || '0', 10).toLocaleString('id-ID')}
                    </span>
                    {paket.hargaAsli && paket.hargaAsli !== '0' && (
                      <span className="text-xs text-sky-200/50 line-through font-bold">
                        Rp {parseInt(paket.hargaAsli || '0', 10).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <Button 
                    disabled={isAllEnrolled}
                    onClick={() => handleBeliPaket(paket.nama, (paket.courses || []).map((c: any) => c.kode))}
                    className={`font-black text-xs uppercase tracking-widest py-6 rounded-2xl w-full transition-all border-none cursor-pointer ${
                      isAllEnrolled
                        ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-not-allowed opacity-80'
                        : isPopular
                        ? 'bg-[#3b82f6] hover:bg-blue-600 text-white shadow-md'
                        : 'bg-[#475569] hover:bg-[#334155] text-white'
                    }`}
                  >
                    {isAllEnrolled ? 'Sudah Dimiliki' : 'Beli Paket'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {(!dbPaketList || dbPaketList.length === 0) && (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 max-w-xl mx-auto shadow-sm mt-8">
            <HiOutlineCreditCard className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Paket Tersedia</h3>
            <p className="text-gray-500 text-sm max-w-xs mx-auto">
              Admin belum mempublikasikan paket bundling untuk kurikulum ini.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderReferralSection = () => {
    const studentName = user?.nama || localStorage.getItem('userName') || 'Mahasiswa';
    const cleanName = studentName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
    const referralCode = `LMS-${cleanName || 'USER'}-2026`;

    const copyToClipboard = () => {
      navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const referralsToDisplay = (referralList || []).map(item => ({
      id: item.id,
      courseName: item.mataKuliah?.nama || 'Kursus',
      codeUsed: item.referralCode || 'Tanpa kode referral',
      dateTime: new Date(item.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      price: item.harga ? (item.harga.startsWith('Rp') ? item.harga : `Rp ${parseInt(item.harga, 10).toLocaleString('id-ID')}`) : 'Rp 0'
    })).filter(item => !deletedReferralIds.includes(item.id));

    const paymentsToDisplay = (pendaftaranList || []).map(item => ({
      id: item.id,
      invoiceNo: item.invoiceNo || `INV/${new Date(item.createdAt).toISOString().replace(/[-:T.Z]/g, '').substring(0, 14)}`,
      courseName: item.mataKuliah?.nama || 'Kursus',
      dateTime: new Date(item.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      price: item.harga ? (item.harga.startsWith('Rp') ? item.harga : `Rp ${parseInt(item.harga, 10).toLocaleString('id-ID')}`) : 'Rp 0',
      method: item.method || 'Virtual Account Mandiri',
      status: item.status || 'Lunas'
    })).filter(item => !deletedPaymentIds.includes(item.id));

    const handleClearAllReferrals = () => {
      if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat referral?')) {
        setDeletedReferralIds(prev => [...prev, ...referralsToDisplay.map(r => r.id)]);
      }
    };

    const handleClearAllPayments = () => {
      if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat pembayaran?')) {
        setDeletedPaymentIds(prev => [...prev, ...paymentsToDisplay.map(p => p.id)]);
      }
    };

    const handleDeleteReferral = (id: string) => {
      setDeletedReferralIds(prev => [...prev, id]);
    };

    const handleDeletePayment = (id: string) => {
      setDeletedPaymentIds(prev => [...prev, id]);
    };

    const totalKomisi = referralsToDisplay.reduce((sum, item) => {
      const numeric = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      return sum + (isNaN(numeric) ? 0 : numeric);
    }, 0);

    return (
      <div className="mt-2 text-left space-y-8">
        {/* Referral & Payment Switch Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-xs font-black uppercase text-gray-700 tracking-wider">
            Sistem Rujukan &amp; Transaksi
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setReferralActiveTab('referral')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                referralActiveTab === 'referral'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Riwayat Referral
            </button>
            <button
              onClick={() => setReferralActiveTab('pembayaran')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                referralActiveTab === 'pembayaran'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              Riwayat Pembayaran
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[1.8rem] border-none shadow-sm bg-white p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kode Referral Anda</div>
              <div className="text-lg font-black text-gray-900 flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-xl text-xs border border-blue-100 font-mono tracking-wider">
                  {referralCode}
                </span>
                <Button 
                  onClick={copyToClipboard} 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg hover:bg-gray-100 shrink-0 text-blue-600"
                  title="Salin Kode"
                >
                  {copied ? <HiOutlineCheck className="w-4 h-4 text-emerald-600" /> : <HiOutlineClipboard className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wide mt-4">Bagikan ke teman untuk diskon paket/kursus 10%</p>
          </Card>

          <Card className="rounded-[1.8rem] border-none shadow-sm bg-white p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Komisi Terkumpul</div>
              <div className="text-xl font-black text-blue-600">
                Rp {totalKomisi.toLocaleString('id-ID')}
              </div>
            </div>
            <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wide mt-4">Diperoleh dari {referralsToDisplay.length} referral sukses</p>
          </Card>

          <Card className="rounded-[1.8rem] border-none shadow-sm bg-white p-6 flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300">
            <div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pencairan Dana</div>
              <div className="text-xs font-black text-gray-800 flex items-center gap-1.5 mt-1.5">
                <HiOutlineCreditCard className="w-4 h-4 text-blue-600" /> Bank Transfer (Aktif)
              </div>
            </div>
            <p className="text-[9px] text-gray-450 font-bold uppercase tracking-wide mt-4">Pencairan diproses setiap tanggal 25</p>
          </Card>
        </div>

        {/* Tab Content */}
        {referralActiveTab === 'referral' ? (
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-2">
                Riwayat Referral 
                <span className="text-[10px] text-gray-400 font-normal uppercase normal-case tracking-normal font-sans ml-1">
                  {referralsToDisplay.length} entri
                </span>
              </h4>
              {referralsToDisplay.length > 0 && (
                <button 
                  onClick={handleClearAllReferrals}
                  className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" /> Hapus semua
                </button>
              )}
            </div>

            {referralsToDisplay.length === 0 ? (
              <Card className="rounded-[2rem] border-none shadow-sm bg-white p-12 text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <HiOutlineTag className="text-3xl" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-gray-900">Belum Ada Rujukan</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                    Teman Anda belum mendaftar menggunakan kode Anda. Bagikan kode Anda untuk memperoleh bonus komisi.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {referralsToDisplay.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-350 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <HiOutlineTag className="text-lg text-[#357ABD]" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-gray-900 leading-snug">
                          {item.courseName}
                        </h3>
                        <p className="text-[9px] font-bold text-gray-450 mt-0.5 leading-none">
                          {item.codeUsed}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-gray-450 mt-2 font-bold uppercase tracking-wider">
                          <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.dateTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-blue-600 whitespace-nowrap">
                        {item.price}
                      </span>
                      <Button
                        onClick={() => handleDeleteReferral(item.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="Hapus"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-2">
                Riwayat Pembayaran 
                <span className="text-[10px] text-gray-400 font-normal uppercase normal-case tracking-normal font-sans ml-1">
                  {paymentsToDisplay.length} transaksi
                </span>
              </h4>
              {paymentsToDisplay.length > 0 && (
                <button 
                  onClick={handleClearAllPayments}
                  className="text-[10px] font-black uppercase text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
                >
                  <HiOutlineTrash className="w-3.5 h-3.5" /> Hapus semua
                </button>
              )}
            </div>

            {paymentsToDisplay.length === 0 ? (
              <Card className="rounded-[2rem] border-none shadow-sm bg-white p-12 text-center max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <HiOutlineCreditCard className="text-3xl" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-black text-gray-900">Belum Ada Transaksi</h3>
                  <p className="text-xs text-gray-500 font-medium max-w-xs mx-auto">
                    Riwayat pembayaran Anda kosong. Beli kelas berbayar untuk melihat riwayat transaksi.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {paymentsToDisplay.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-350 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <HiOutlineDocumentText className="text-lg text-[#357ABD]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] font-bold text-gray-450">
                            {item.invoiceNo}
                          </span>
                          <Badge className={`px-2 py-0.5 rounded-full font-black text-[7px] uppercase tracking-wider border-none ${
                            item.status === 'Lunas' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : item.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {item.status}
                          </Badge>
                        </div>
                        <h3 className="text-xs font-black text-gray-900 leading-snug mt-1">
                          {item.courseName}
                        </h3>
                        <p className="text-[9px] font-bold text-gray-450 mt-1">
                          Metode: {item.method}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] text-gray-450 mt-2 font-bold uppercase tracking-wider">
                          <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.dateTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <span className="text-xs font-black text-gray-900 whitespace-nowrap">
                        {item.price}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => window.print()}
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-gray-200 text-[10px] font-black uppercase h-7 px-3"
                        >
                          Kuitansi
                        </Button>
                        <Button
                          onClick={() => handleDeletePayment(item.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          title="Hapus"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Title Header */}
      <div className="mb-6 text-left">
        <span className="text-xs text-blue-600 font-extrabold tracking-wider block mb-0.5">
          {activePath} Path
        </span>
        <h1 className="text-3xl font-black text-gray-900 leading-none">Kursus Tersedia</h1>
      </div>

      {/* Top Navy Blue Path Progress Container */}
      <div className="bg-[#0b2e44] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6 shadow-md border border-sky-950">
        <div className="flex items-center gap-2">
          <HiOutlineTrophy className="text-yellow-400 text-lg shrink-0" />
          <span className="text-xs font-black text-white uppercase tracking-wider">{activePath} Path:</span>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {pathSteps.map((step, idx) => {
            const showStep = step.exists;
            const isDone = step.enrolled;
            return (
              <div 
                key={idx}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase transition-all shadow-sm ${
                  isDone 
                    ? 'bg-white text-gray-900' 
                    : step.active 
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/20' 
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {isDone ? (
                  <span className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                ) : step.trophy ? (
                  <span className="text-yellow-400">🏆</span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${step.active ? 'bg-sky-400' : 'bg-white/20'}`} />
                )}
                <span>{step.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['Semua', 'Free', 'Berbayar', 'Course map'] as const).map((filterName) => (
          <button
            key={filterName}
            onClick={() => setActiveFilter(filterName)}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border shadow-sm ${
              activeFilter === filterName
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filterName}
          </button>
        ))}
        <button 
          onClick={() => setActiveFilter('Referall')}
          className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border shadow-sm ${
            activeFilter === 'Referall'
              ? 'bg-black text-white border-black'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Referall
        </button>

        {activeFilter === 'Course map' && (
          <div className="relative inline-block">
            <select 
              value={courseMapMode}
              onChange={(e) => setCourseMapMode(e.target.value as 'individual' | 'paket')}
              className="appearance-none bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 pl-4 pr-8 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border shadow-sm outline-none cursor-pointer"
            >
              <option value="individual">Individual learn</option>
              <option value="paket">Paket</option>
            </select>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Grouped Course Lists or Course Map Roadmap or Paket Bundling or Referral Section */}
      {activeFilter === 'Course map' ? (
        courseMapMode === 'individual' ? renderRoadmapTimeline() : renderPaketSection()
      ) : activeFilter === 'Referall' ? (
        renderReferralSection()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredCourses.map(course => renderCourseCard(course))}
        </div>
      )}
      
      {activeFilter !== 'Course map' && activeFilter !== 'Referall' && filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 max-w-xl mx-auto shadow-sm">
          <HiOutlineBookOpen className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Kursus</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Tidak ada kelas aktif yang sesuai dengan kriteria penyaringan filter saat ini.
          </p>
        </div>
      )}

      {/* Enroll & Payment Simulation Dialog Modal */}
      <Dialog open={isEnrollModalOpen} onOpenChange={(open) => {
        setIsEnrollModalOpen(open);
        if (!open) {
          setPaymentStep('details');
          setReferralInput("");
          setCopiedVA(false);
        }
      }}>
        <DialogContent className={`rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white transition-all duration-300 ${paymentStep === 'success' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}>
          {/* Header Banner */}
          {paymentStep === 'success' ? (
            <div className="bg-[#0fa44a] px-6 py-6 text-white flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#0fa44a] shrink-0 shadow-sm">
                <HiOutlineCheck className="w-6 h-6 stroke-[3]" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black tracking-wide leading-tight text-white">Pembayaran Berhasil</h2>
                <p className="text-[11px] text-white/95 font-bold mt-1 leading-snug">
                  Kursus <strong className="font-black text-white">{selectedCourseToEnroll?.nama || 'Nama Kursus'}</strong> sudah aktif di akun kamu.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1d75d3] px-6 py-5 text-white">
              <h2 className="text-lg font-black tracking-wide leading-none">
                {paymentStep === 'details' ? 'Enroll Kursus' : paymentStep === 'simulate' ? 'Simulasi Pembayaran' : 'Pembayaran Sukses'}
              </h2>
              <p className="text-xs text-blue-100 font-bold mt-2 tracking-wide uppercase">
                {selectedCourseToEnroll?.nama || 'Nama Kursus'}
              </p>
            </div>
          )}

          {paymentStep === 'details' ? (
            /* Step 1: Details & Bank Selection */
            <div className="p-6 space-y-6">
              {(() => {
                if (!selectedCourseToEnroll) return null;
                const priceInfo = getPriceDisplay(selectedCourseToEnroll.warna);
                const priceNum = parseInt(selectedCourseToEnroll.warna?.replace(/[^0-9]/g, '') || '0', 10);
                
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
                <span>Waktu pendaftaran akan dicatat: {getFormattedCurrentTime()}</span>
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
                      if (!selectedCourseToEnroll) return 'Rp 0';
                      const priceNum = parseInt(selectedCourseToEnroll.warna?.replace(/[^0-9]/g, '') || '0', 10);
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
                    if (!selectedCourseToEnroll) return;
                    const priceNum = parseInt(selectedCourseToEnroll.warna?.replace(/[^0-9]/g, '') || '0', 10);
                    const hasReferral = referralInput.trim().length > 0;
                    const discountAmount = hasReferral ? Math.round(priceNum * 0.1) : 0;
                    const finalPrice = priceNum - discountAmount;
                    
                    await handleEnroll(
                      selectedCourseToEnroll.id, 
                      referralInput.trim() || undefined, 
                      finalPrice.toString(),
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
                        if (!selectedCourseToEnroll) return 'Rp 0';
                        const priceNum = parseInt(selectedCourseToEnroll.warna?.replace(/[^0-9]/g, '') || '0', 10);
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
                      {selectedCourseToEnroll?.jumlahPertemuan || 12}
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
                    if (selectedCourseToEnroll?.id) {
                      navigate(`/user/detail-kursus?id=${selectedCourseToEnroll.id}`);
                    }
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

export default KursusTersedia;

# 🚀 LMS Hybrid - Progress Log & Context

Dokumen ini berisi catatan progres pengembangan sistem **LMS Hybrid** dengan fokus pada integrasi AI dan antarmuka premium berbasis role.

---

## 🎯 Status Proyek Saat Ini
Sistem telah memiliki 4 role utama dengan alur kerja yang sudah disinkronkan sesuai revisi terbaru (Mei 2026):
- **Admin**: Manajemen user, kursus, jadwal, dan assignment pengajar/asisten.
- **Pengajar (Dosen)**: Monitoring mahasiswa per materi assigned & manajemen konten multi-video.
- **Asisten**: Koreksi manual (Refleksi & Upload) dengan referensi skor AI.
- **Mahasiswa**: Pembelajaran interaktif, pengerjaan tugas, dan sistem nilai AI.

---

## ✨ Fitur yang Baru Diselesaikan (Revisi Terakhir)

### 1. Role Pengajar (Dosen) - DR. Reza F
- **Monitoring Mahasiswa**: Dashboard statistik untuk memantau performa kelas secara makro dan detail mahasiswa per materi (P1-P14).
- **Edit/Add Materi**: Form modular untuk menambahkan banyak video (TikTok/Link/Upload), sub-materi PDF, soal PG, dan pertanyaan refleksi dalam satu pertemuan.
- **Logic**: Hanya bisa mengakses materi yang di-assign oleh Admin.

### 2. Role Asisten - Asisten 1
- **Halaman Koreksi Manual**: Tabel terpusat untuk semua jenis tugas.
- **Koreksi Refleksi**: Form sidebar untuk input nilai akhir dengan referensi skor AI.
- **Koreksi Upload**: Halaman detail khusus untuk meninjau screenshot coding dan file ZIP project.
- **Auto Correction Overview**: Dashboard untuk memantau statistik tugas yang dikoreksi otomatis oleh AI (Latihan PG).

### 3. Role Mahasiswa - Budi Santoso
- **Detail Kursus Premium**: Visualisasi 14 sesi pertemuan dengan status (Aktif, Selesai, Terkunci).
- **Materi Sesi**: Halaman belajar lengkap dengan video player, download PDF, form refleksi, dan area upload tugas.
- **Review Mode**: Mahasiswa bisa masuk kembali ke materi yang sudah selesai untuk belajar ulang.

### 4. Role Admin (Backend) [NEW]
- **Assignment Logic (`POST /api/admin/assign-pengajar`)**: API untuk mengaitkan Dosen atau Asisten ke Mata Kuliah secara global, atau ke Pertemuan (sesi 1-14) secara spesifik.
- **AI Knowledge Sync (`POST /api/admin/ai-sync`)**: API untuk menyelaraskan modul materi pembelajaran dengan Vector Database menggunakan Google Gemini embedding model (768 dimensi) secara real-time.

### 5. Role Student (Backend) [NEW]
- **Gemini AI Auto-Grader (`POST /api/student/refleksi/submit`)**: Integrasi engine LLM Google Gemini Flash untuk secara otomatis mengoreksi esai refleksi mahasiswa secara semantik dan memberikan skor referensi (0-100) beserta feedback tertulis secara langsung.
- **Practice Upload (`POST /api/student/upload/tugas`)**: API untuk pengiriman screenshot hasil program atau file program ZIP ke database.
- **Session Progress (`POST /api/student/status/progres` & `GET /api/student/status/progres`)**: Manajemen dan sinkronisasi checkpoint progres belajar (tonton video, pengerjaan tugas, selesai) per pertemuan (P1-P14).

---

## 🛠️ Struktur File Baru (Frontend)
| Halaman | Lokasi File | Fungsi Utama |
| :--- | :--- | :--- |
| **Monitoring (Dosen)** | `src/pages/pengajar/MonitoringMahasiswa.tsx` | Pantau nilai & status upload mhs |
| **Add Materi (Dosen)** | `src/pages/pengajar/AddMateri.tsx` | Manajemen konten multi-multimedia |
| **Koreksi (Asisten)** | `src/pages/asisten/HalamanKoreksi.tsx` | List tugas & koreksi esai (sidebar) |
| **Upload Detail (Asisten)** | `src/pages/asisten/KoreksiUploadDetail.tsx` | Review file/screenshot & checklist |
| **Materi Sesi (Mhs)** | `src/pages/user/MateriSesi.tsx` | Tempat mhs belajar & kumpul tugas |
| **UI Components** | `src/components/ui/` | Checkbox, RadioGroup, Label, Progress, dll |

---

## ⚙️ Context Teknis (Penting untuk Developer)
- **Tema Visual**: Menggunakan **Blue Premium Theme** (`#357ABD`) untuk role Mahasiswa, Asisten, dan Pengajar. Role Admin menggunakan tema **White/Emerald**.
- **Sidebar & Navbar**: Bersifat dinamis berdasarkan role yang tersimpan di `localStorage.getItem('userRole')`.
- **Dependency Baru**:
  - `@radix-ui/react-checkbox` & `@radix-ui/react-radio-group` (Komponen UI)
  - `lucide-react` & `react-icons/hi2` (Icons)
  - `class-variance-authority` (Tailwind variant management)

---

## ⏭️ Langkah Selanjutnya (Next Steps)
1. **Integrasi Backend (API Binding)**:
   - Hubungkan `AddMateri.tsx` dengan endpoint `/materi` untuk menyimpan data permanen.
   - Sinkronisasi data monitoring dengan database nilai mahasiswa yang sesungguhnya.
2. **Sistem Ujian AI**: Implementasi halaman Ujian Akhir yang terbuka secara otomatis setelah Pertemuan 14 selesai.
3. **Real-time Notification**: Notifikasi untuk asisten saat ada tugas baru yang masuk untuk dikoreksi.

---
*Terakhir diupdate: 18 Mei 2026 oleh Antigravity*

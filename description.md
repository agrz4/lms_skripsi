# Hybrid Learning Management System (LMS) - Admin Dashboard

Dashboard Admin untuk sistem pembelajaran hibrida yang mengintegrasikan kecerdasan artifisial (RAG & SLM) untuk manajemen kursus, pengajar, dan penilaian otomatis.

## 🚀 Tech Stack

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/UI (Radix UI)
- **State Management:** Zustand
- **Routing:** React Router Dom v7
- **Icons:** React Icons (Heroicons 2)

## ✨ Fitur Utama (Role Admin)

### 1. Manajemen Pengajar
- Pengelolaan data instruktur/pengajar secara komprehensif.
- Fitur pencarian dan filter status aktif.
- Modal input modern dengan validasi otomatis.

### 2. Manajemen Kursus & Kurikulum
- **Multi-step Wizard:** Alur pembuatan kursus yang terstruktur (Data Kursus -> Jadwal -> Materi -> Publish).
- **Integrasi Materi:** Unggah file PDF/Video dan pembuatan kuis terintegrasi.
- **Assignment:** Penugasan pengajar dan asisten ke jadwal spesifik.

### 3. AI Knowledge Base (RAG & SLM)
- **Monitoring Pipeline:** Visualisasi alur materi dari transkripsi hingga menjadi basis pengetahuan AI.
- **Indexing Status:** Pemantauan real-time status indexing materi ke dalam sistem RAG.
- **Global Actions:** Re-index semua materi atau retry proses yang error.

### 4. Auto Correction AI
- **Automated Grading:** Penilaian otomatis untuk ujian dan tugas pilihan ganda menggunakan model SLM.
- **Visual Analytics:** Progress bar untuk skor AI dan indikator kelulusan.
- **AI Engine Stats:** Monitoring beban inferensi dan arsitektur mesin AI (NVIDIA NIM).

### 5. Laporan Akhir (End Kursus)
- **Rekap Nilai Otomatis:** Akumulasi nilai dari semua materi dan ujian akhir.
- **Analytics Kelulusan:** Statistik jumlah peserta lulus vs tidak lulus.
- **Export Data:** Fitur export laporan ke format Excel untuk kebutuhan administratif.

## 🛠️ Instalasi & Persiapan

Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di sistem Anda.

1. **Clone Repositori**
   ```bash
   git clone <repository-url>
   cd lms_skripsi
   ```

2. **Instalasi Dependensi**
   Masuk ke direktori frontend:
   ```bash
   cd frontend
   npm install
   ```

3. **Menjalankan Server Pengembangan**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:5173](http://localhost:5173) di browser Anda.

## 📂 Struktur Folder (Frontend)

- `src/components/ui`: Komponen dasar dari Shadcn/UI.
- `src/layouts`: Layout wrapper (AdminLayout).
- `src/pages/admin`: Halaman-halaman utama dashboard admin.
- `src/store`: State management menggunakan Zustand.
- `src/lib`: Utilitas dan konfigurasi helper.

---

Dikembangkan oleh **Antigravity AI** untuk keperluan skripsi Sistem LMS Hybrid.

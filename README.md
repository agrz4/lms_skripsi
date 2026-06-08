# 📚 Hybrid Learning Management System (LMS) - Berbasis AI (RAG & Gemini)

Platform LMS Hybrid modern yang dirancang untuk mendukung berbagai metode pembelajaran (*Online Meeting*, *Micro Learning*, dan *General Learning*) serta diintegrasikan dengan kecerdasan artifisial (RAG & LLM/SLM) menggunakan model **Google Gemini AI** dan database vektor **PostgreSQL (pgvector)**.

Dokumen ini merupakan panduan lengkap setup proyek, arsitektur, dan penjelasan fitur untuk keperluan penelitian/tugas akhir.

> **Skripsi 2026 — Universitas Gunadarma**  
> **Pembimbing:** Dr. Koko Bachrudin., S.Kom., MMSI

---

## 🗂️ Struktur Proyek

Berikut adalah struktur direktori utama dari sistem LMS Hybrid yang terbagi menjadi `backend` dan `frontend`:

```
lms-hybrid/
├── frontend/                   # React + Vite + TypeScript (Client)
│   ├── src/
│   │   ├── components/         # Komponen UI Reusable (Shadcn/UI, Layouts)
│   │   ├── layouts/            # Layout utama (AdminLayout)
│   │   ├── lib/                # Konfigurasi Axios & utilitas (api.ts)
│   │   ├── pages/              # Halaman dashboard berdasarkan Role
│   │   │   ├── admin/          # Panel Admin Kursus, AI Knowledge, Auto-Correction
│   │   │   ├── asisten/        # Panel Koreksi Asisten & Auto-Correction Log
│   │   │   ├── pengajar/       # Panel Dosen & Monitoring Mahasiswa
│   │   │   └── user/           # Dashboard Mahasiswa, Detail Kursus, Materi Sesi, Ujian
│   │   ├── store/              # State Management dengan Zustand
│   │   ├── App.tsx             # Routing & Protected Routes (App.tsx)
│   │   └── index.css           # Styling dasar Tailwind CSS v4
│   └── package.json
│
├── backend/                    # Node.js + Express (Server)
│   ├── prisma/
│   │   └── schema.prisma       # Skema Database PostgreSQL + pgvector (schema.prisma)
│   ├── src/
│   │   ├── config/             # Konfigurasi Database & Environment
│   │   ├── controllers/        # Express Controllers (Logic API)
│   │   ├── middlewares/        # Authentication, Role Checker, & File Upload
│   │   ├── routes/             # Routing API Express
│   │   ├── services/           # Service AI & RAG (Gemini API & pgvector)
│   │   │   ├── embeddingService.js
│   │   │   ├── evaluasiService.js
│   │   │   └── ragService.js
│   │   └── app.js              # Entrypoint Server Utama
│   ├── .env                    # Environment Variable Backend
│   └── package.json
│
├── README.md                   # Dokumentasi Utama Proyek
├── PROGRESS.md                 # Log Progress Pengerjaan Proyek
└── BACKEND_INTEGRATION_PENDING.md # Catatan Integrasi yang Selesai/Pending
```

---

## ⚙️ Tech Stack & Spesifikasi AI

| Layer | Teknologi | Deskripsi |
|---|---|---|
| **Frontend** | React 19 (TypeScript) + Vite | Library framework UI dengan build tool berkecepatan tinggi |
| **Styling** | Tailwind CSS v4 + Shadcn/UI | Sistem desain modern dengan komponen UI premium |
| **State Management** | Zustand | Manajemen state global yang ringan dan termodulasi |
| **Backend** | Node.js + Express.js | RESTful API server dengan arsitektur bersih |
| **ORM** | Prisma 7 | Query builder modern dan type-safe |
| **Database** | PostgreSQL | Penyimpanan relasional utama (Dijalankan di WSL/Local) |
| **Vector DB** | `pgvector` Extension | Ekstensi PostgreSQL untuk indexing & similarity search vektor |
| **LLM Engine** | **Google Gemini Flash API** | Model `models/gemini-flash-latest` untuk auto-grading esai & evaluasi soal |
| **Embedding Engine** | **Google Gemini Embedding** | Model `models/gemini-embedding-001` (Output: 768 dimensi) |
| **Authentication** | JWT + Bcryptjs | Pengamanan rute dan hashing password pengguna |

---

## ✨ Fitur Utama Berdasarkan Peran (Roles)

Sistem ini memfasilitasi 4 tingkatan akses (*roles*):

### 1. 🔑 Admin Kursus (Administrator)
*   **Manajemen Pengguna:** CRUD data Dosen dan Asisten secara real-time.
*   **Manajemen Kursus & Kurikulum (4-Step Wizard Flow):**
    *   *Step 1 (Kursus):* CRUD data Mata Kuliah (Nama, Kode, Deskripsi, Level).
    *   *Step 2 (Jadwal):* Pembagian sesi kelas, penentuan tanggal/jam, dan tugas Dosen + Asisten.
    *   *Step 3 (Materi):* Pengunggahan bahan ajar per pertemuan.
    *   *Step 4 (Publish):* Publikasi kursus agar bisa di-enroll oleh mahasiswa.
*   **AI Knowledge Base:** Pemantauan real-time status indexing embedding materi (Sync Status: `WAITING`, `PROCESSING`, `SUCCESS`, `FAILED`) dan opsi untuk pemicu sinkronisasi/reindex ulang global.
*   **Auto-Correction Queue:** Verifikasi soal yang dibuat otomatis oleh AI dengan sistem moderasi (*Approve/Reject*).
*   **Laporan Akhir & Kelulusan:** Visualisasi nilai kumulatif, statistik lulus/tidak lulus, serta cetak/generate nomor sertifikat kelulusan digital unik.

### 2. 👨‍🏫 Dosen (Pengajar)
*   **Portal Materi Pembelajaran:** Mengunggah konten ajar sesuai kategori pertemuan:
    *   🎥 *Online Meeting* (tautan atau rekaman Zoom).
    *   📱 *Micro Learning* (tautan video pendek YouTube/TikTok, atau video MP4 lokal).
    *   📄 *General Learning* (dokumen PDF materi kuliah).
*   **Monitoring Mahasiswa:** Dashboard pemantauan perkembangan belajar mahasiswa, progres tugas, dan visualisasi nilai secara *real-time*.

### 3. 🎓 Asisten (Co-Instructor)
*   **Portal Koreksi Manual:** Review berkas pengerjaan tugas mahasiswa (teks refleksi esai, screenshot, & file ZIP tugas project).
*   **Override & Feedback:** Memberikan umpan balik (feedback) tertulis dan mengunggah nilai final manual (0-100) untuk menimpa nilai referensi otomatis dari AI.
*   **Monitoring Log AI:** Memantau log pengerjaan mahasiswa dan performa engine auto-correction.

### 4. 👨‍🎓 Mahasiswa (Peserta Didik)
*   **Pendaftaran & Dashboard:** Registrasi akun, pendaftaran mata kuliah aktif, dan pemantauan visual 14 sesi pertemuan yang interaktif.
*   **Pembelajaran Interaktif:** Menonton video (Micro Learning), membaca PDF langsung pada browser via PDF Viewer, dan checklist status penyelesaian sesi otomatis.
*   **Pengumpulan Latihan Praktik:** Upload berkas screenshot & ZIP project yang dilengkapi dengan animasi loader (0-100%).
*   **Auto-Correction Gemini AI:** Jawaban esai reflektif dikoreksi secara instan oleh model Gemini API untuk mendapatkan skor referensi (0-100) dan umpan balik analitis.
*   **Sistem Ujian Akhir AI:** Mengerjakan ujian akhir online (30 soal acak) dengan logika *unlock* (tombol ujian baru aktif jika ke-14 pertemuan berstatus `isCompleted`).
*   **Sertifikasi Digital:** Mengunduh sertifikat kelulusan dalam format SVG/PDF jika dinyatakan lulus berdasarkan perhitungan nilai kumulatif (30% Refleksi + 35% Tugas + 35% Ujian).

---

## 🚀 Panduan Instalasi & Setup Proyek

### 1. Prasyarat Sistem
*   [Node.js](https://nodejs.org/) v18 atau lebih baru.
*   [PostgreSQL](https://www.postgresql.org/) v15+ dengan ekstensi **`pgvector`** (Rekomendasi diinstal di dalam **WSL**).
*   **Google Gemini API Key** (untuk integrasi kecerdasan buatan).

### 2. Setup Database & pgvector (WSL / Local)
Buka terminal database PostgreSQL (melalui psql atau DBeaver) dan jalankan perintah:

```sql
-- Buat database baru
CREATE DATABASE lms_skripsi;

-- Sambungkan ke database baru
\c lms_skripsi

-- Aktifkan ekstensi pgvector dan UUID
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. Setup Backend (Express Server)

1.  Masuk ke folder backend:
    ```bash
    cd backend
    npm install
    ```
2.  Buat file `.env` di dalam folder `backend/` dan sesuaikan nilainya:
    ```env
    PORT=5000
    NODE_ENV=development

    # URL Database PostgreSQL
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lms_skripsi?schema=public"

    # API Key Google Gemini
    GEMINI_API_KEY="AIzaSyD7U..."

    # Konfigurasi Keamanan JWT
    JWT_SECRET="rahasia_super_kuat_anda"
    JWT_EXPIRES_IN=7d
    ```
3.  Jalankan migrasi Prisma untuk membuat tabel-tabel database (PENTING: Jika database berjalan di WSL, jalankan perintah ini di dalam WSL terminal):
    ```bash
    npx prisma migrate dev --name init
    npx prisma generate
    ```

### 4. Setup Frontend (React Client)

1.  Masuk ke folder frontend:
    ```bash
    cd ../frontend
    npm install
    ```
2.  Secara default, client akan terhubung ke `http://localhost:5000/api` melalui modul Axios di `api.ts`.

---

## 🏃 Menyederhanakan Menjalankan Aplikasi

Jalankan perintah development server di kedua folder secara bersamaan:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Aplikasi frontend akan tersedia di [http://localhost:5173](http://localhost:5173).

---

## 🤖 Mekanisme Alur Kerja Modul AI (RAG & Gemini)

### 1. Alur Sinkronisasi & Knowledge Embedding (RAG)
```
[Bahan Ajar PDF / Video] ──> [Extract Teks & Transkrip]
                                      │
                                      ▼
[Database pgvector] <── [Generate Embedding (gemini-embedding-001)]
```
Materi perkuliahan yang diunggah oleh Dosen diproses secara asinkron. Teks diekstrak dan diubah menjadi vektor 768 dimensi menggunakan model `gemini-embedding-001` untuk disimpan dalam tabel `SoalVector`.

### 2. Alur Pencarian Kemiripan (Similarity Search)
Saat mengevaluasi soal ujian/materi baru:
1.  Pertanyaan diubah menjadi vektor pencarian.
2.  Melakukan perhitungan jarak kosinus (*cosine distance*) di PostgreSQL:
    `1 - (embedding <=> query_embedding)`.
3.  Mengambil $N$ soal dengan tingkat kemiripan tertinggi di atas threshold (0.75).

### 3. Evaluasi & Auto-Correction Esai Refleksi
```
[Jawaban Esai Mahasiswa] ──> [Evaluasi dengan gemini-flash-latest + Konteks RAG]
                                               │
                                               ▼
[Nilai Referensi & Umpan Balik] ──> [Disimpan & Ditinjau Asisten]
```
Jawaban esai dikirimkan ke model `gemini-flash-latest` dengan petunjuk sistem khusus (*system prompt*) untuk memberikan penilaian yang terstruktur dalam format JSON, mengecek kesesuaian jawaban dengan materi ajar, mendeteksi plagiarism/duplikasi, serta memberikan saran perbaikan langsung kepada mahasiswa.

---

## ⚠️ Catatan Penting & Troubleshooting (Gotchas)

*   **Error "pgvector extension not found"**: Terjadi karena database PostgreSQL di Windows host tidak memiliki pustaka ekstensi vector. Solusi: Gunakan PostgreSQL yang berjalan di WSL (Ubuntu) atau Docker Postgres-Vector image.
*   **Prisma Client Error setelah Migrasi**: Pastikan untuk selalu menjalankan `npx prisma generate` di dalam terminal WSL setelah mengubah skema di `schema.prisma` agar client Javascript sinkron dengan struktur database terbaru.
*   **Model Rate Limits**: Disarankan menggunakan model `gemini-flash-latest` untuk menjaga kecepatan respon evaluasi real-time dan menghindari pemakaian kuota API secara berlebihan selama masa pengembangan.

---

*Proyek ini dikembangkan untuk keperluan akademik dan penelitian skripsi Universitas Gunadarma.*

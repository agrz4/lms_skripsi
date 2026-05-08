# Progress Proyek: LMS Hybrid Berbasis AI

Dokumen ini dibuat untuk menyimpan konteks pengerjaan proyek agar asisten AI dapat melanjutkan pekerjaan dengan pemahaman yang sama di sesi berikutnya.

## 📌 Status Terakhir
*   **Peran Fokus Saat Ini**: Admin Kursus (Manajemen Kurikulum & Pengguna).
*   **Fitur Terbaru**: Penyelesaian alur 4-Step di Manajemen Kursus (Step 1: Buat Kursus, Step 2: Jadwal & Assign Role, Step 3: Materi, Step 4: Publish).

---

## 🛠️ Arsitektur & Teknologi

### Backend (Folder: `backend`)
*   **Runtime**: Node.js with Express.
*   **Database**: PostgreSQL dengan ekstensi `pgvector` (Berjalan di dalam **WSL**).
*   **ORM**: Prisma 7.
*   **Autentikasi**: JWT & Bcryptjs.
*   **Catatan Penting**: Karena `pgvector` diinstal di WSL, semua perintah Prisma (`prisma db push`, `prisma generate`, dll.) **HARUS dijalankan di dalam terminal WSL** agar tidak error.

### Frontend (Folder: `frontend`)
*   **Framework**: React dengan Vite & TypeScript.
*   **State Management**: Zustand (Setiap modul memiliki store terpisah seperti `useMataKuliahStore`, `useJadwalStore`, dll).
*   **Styling**: Tailwind CSS & Shadcn UI.

---

## 🚀 Fitur yang Sudah Selesai (Done)

### 1. Autentikasi & Role
*   Mendukung 4 Role: `ADMIN`, `DOSEN`, `ASISTEN`, `MAHASISWA`.
*   Login flow sudah memetakan role dari database ke rute frontend.
*   Logout sudah berfungsi membersihkan local storage.

### 2. Dashboard Admin
*   **Statistik**: Menampilkan jumlah Dosen, Asisten, Mahasiswa, dan Kursus secara real-time dari database.
*   **Manajemen Pengajar/User**: CRUD (Create, Read, Update, Delete) untuk Dosen dan Asisten sudah terintegrasi backend.
*   **Manajemen Kursus**:
    *   **Step 1 (Kursus)**: CRUD Mata Kuliah.
    *   **Step 2 (Jadwal)**: Input hari, tanggal, dan assign Dosen + Asisten.
    *   **Step 3 (Materi)**: Input nama materi dan relasi ke kursus.
    *   **Step 4 (Publish)**: Mengubah status `published` menjadi `true`.

---

## 📝 Data Dummy / Akun Tes
*   **Admin**: `admin@lms.com` / `admin123`
*   **Dosen**: `dosen@lms.com` / `password123`
*   **Asisten**: `asisten@lms.com` / `password123`
*   **Mahasiswa**: `mhs@lms.com` / `password123`

---

## ⏳ Pekerjaan Rumah (To-Do List)

### Prioritas Tinggi
1.  **AI Knowledge (`AIKnowledge.tsx`)**: Saat ini masih menggunakan data bohongan (mock). Perlu diintegrasikan dengan fitur RAG / Vector DB yang ada di backend.
2.  **Auto Correction (`AutoCorrection.tsx`)**: Masih menggunakan data mock. Perlu dihubungkan dengan endpoint penilaian otomatis.

### Skala Menengah/Panjang
3.  **Dashboard Dosen & Asisten**: Memastikan mereka bisa melihat jadwal dan materi yang di-assign oleh Admin.
4.  **Fitur Pendaftaran (Enrollment)**: Menghubungkan Mahasiswa ke Kursus yang sudah di-publish agar mereka bisa melihat jadwalnya.

---

## ⚠️ Gotchas & Solusi Masalah Lalu
*   **Error "useState is not defined"**: Terjadi karena lupa import React hooks di file TSX.
*   **Error "pgvector not found" di Windows**: Karena Postgres di host Windows tidak punya ekstensi tersebut. Solusi: Selalu gunakan database di WSL.
*   **Error "Cannot read properties of undefined (reading 'create')"**: Terjadi karena lupa menjalankan `npx prisma generate` setelah melakukan `prisma db push`.

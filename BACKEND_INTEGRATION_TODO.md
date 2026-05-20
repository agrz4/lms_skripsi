# 🛠️ Backend Integration Checklist

Daftar tugas integrasi API untuk menghubungkan Frontend UI dengan Backend sistem LMS Hybrid.

---

## 👨‍🎓 Role: Mahasiswa (Student) [COMPLETED]
- [x] **Materi Sesi (`/user/materi-sesi`)**:
    - `GET /materi?pertemuanId={id}`: Mengambil list video, PDF, dan pertanyaan refleksi yang di-upload pengajar (Tersedia default di `/api/materi`).
    - `POST /refleksi/submit`: Mengirim esai mhs + trigger **Gemini AI Auto-Grader** untuk menghasilkan skor AI (Tersedia di `/api/student/refleksi/submit`).
    - `POST /upload/tugas`: Mengirim file screenshot / project ZIP ke database (Tersedia di `/api/student/upload/tugas`).
    - `POST /status/progres`: Update status "Selesai" atau video watchedTime pada pertemuan (Tersedia di `/api/student/status/progres`).
- [x] **Detail Kursus**:
    - Sinkronisasi `completedSessions` dengan status progres di database (Tersedia `GET /api/student/status/progres`).

---

## 🧑‍🏫 Role: Pengajar (Teacher/Dosen) [COMPLETED]
- [x] **Add/Edit Materi (`/pengajar/add-materi`)**:
    - `POST /materi/create`: Menyimpan data pertemuan (Judul, Deskripsi, Link TikTok/Zoom).
    - `POST /materi/upload-video`: Endpoint untuk upload video lokal ke server (Tersedia di `/api/materi/upload-video`).
    - `POST /materi/upload-submateri`: Endpoint untuk upload file PDF/Modul (Tersedia di `/api/materi/upload-submateri`).
    - `POST /materi/latihan-pg`: Simpan soal pilihan ganda ke database (Tersedia di `/api/materi/latihan-pg`).
- [x] **Monitoring Mahasiswa (`/pengajar/monitoring`)**:
    - `GET /monitoring/materi-assigned`: Mengambil hanya materi yang di-assign ke dosen tersebut (Tersedia di `/api/monitoring/materi-assigned`).
    - `GET /monitoring/stats`: Agregasi nilai rata-rata kelas, total mhs, dan keaktifan (Tersedia di `/api/monitoring/stats`).
    - `GET /monitoring/detail-mhs?pertemuanId={id}`: Mengambil list mhs dan status tugas mereka per sesi (Tersedia di `/api/monitoring/detail-mhs`).

---

## 🧑‍💻 Role: Asisten (Assistant) [COMPLETED]
- [x] **Koreksi Manual (`/asisten/koreksi`)**:
    - `GET /koreksi/list`: Mengambil daftar tugas (Refleksi/Upload) yang masuk dari mahasiswa (Tersedia di `/api/koreksi/list`).
    - `POST /koreksi/submit-nilai`: Mengirim nilai akhir (0-100) dan catatan feedback dari asisten (Tersedia di `/api/koreksi/submit-nilai`).
- [x] **Koreksi Upload Detail (`/asisten/upload`)**:
    - `GET /koreksi/file-detail/{id}`: Mengambil link file/screenshot yang di-upload mhs untuk di-preview (Tersedia di `/api/koreksi/file-detail/:id`).
- [x] **Auto Correction (`/asisten/auto-correction`)**:
    - `GET /ai/stats-pg`: Mengambil data statistik pengerjaan PG yang dikoreksi otomatis oleh AI (Tersedia di `/api/ai/stats-pg`).

---

## 🛡️ Role: Admin (Administrator) [COMPLETED]
- [x] **Assignment Logic**:
    - `POST /admin/assign-pengajar`: Menghubungkan pengajar/asisten tertentu ke materi/pertemuan spesifik (Implementasi di `adminController.js` & `adminRoutes.js`).
- [x] **AI Knowledge Base**:
    - `POST /admin/ai-sync`: Sinkronisasi materi yang di-upload pengajar ke Vector Database/LLM untuk keperluan koreksi otomatis (Implementasi di `adminController.js` & `adminRoutes.js`).

---

## 📦 Global System Tasks [COMPLETED]
- [x] **Authentication Extension**:
    - Update `GET /users/me` untuk mengembalikan data profil lengkap sesuai role (Avatar, Nama Gelar, List Materi Assigned) (Implementasi di `authController.js`).
- [x] **File Storage**:
    - Implementasi penyimpanan file (Multer/S3/Cloudinary) untuk menangani upload video dan dokumen besar dari Pengajar & Mahasiswa (Tersedia di `uploadMiddleware.js`).

---
*Dokumen ini adalah panduan teknis untuk developer backend.*

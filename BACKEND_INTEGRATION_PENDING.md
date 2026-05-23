# ⚠️ Daftar Integrasi Backend yang Belum Selesai (Pending)

Dokumen ini berisi daftar halaman, modul, dan fitur pada LMS Hybrid yang masih menggunakan data tiruan (mock data) di frontend atau membutuhkan pengembangan endpoint baru di backend.

---

## 1. 🎓 Sistem Ujian Akhir & Skor Kelulusan (Role: Mahasiswa) [COMPLETED]
Fitur ini dirancang untuk menguji kompetensi akhir mahasiswa secara komprehensif setelah menyelesaikan materi pembelajaran.

*   **Halaman Frontend**:
    *   `src/pages/user/UjianPage.tsx` ([UjianPage.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/user/UjianPage.tsx))
    *   `src/pages/user/HasilSkorAI.tsx` ([HasilSkorAI.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/user/HasilSkorAI.tsx))
*   **Kondisi Saat Ini**:
    *   Telah terintegrasi penuh dengan database dan AI Gemini untuk pengambilan dan penilaian soal secara real-time.
*   **Pekerjaan Rumah (To-Do)**:
    *   [x] **Prisma Schema**: Tambahkan model `Ujian` dan `UjianSubmission` di `schema.prisma`.
    *   [x] **Backend Router & Controller**:
        *   `GET /api/ujian/soal`: Mengambil daftar soal ujian secara acak berdasarkan materi kursus.
        *   `POST /api/ujian/submit`: Menerima jawaban mahasiswa, melakukan scoring otomatis, dan menyimpan skor final ke database.
    *   [x] **Frontend Binding**: Hubungkan `UjianPage.tsx` agar mengambil soal riil dari API dan mengirimkan lembar jawaban saat submit.
    *   [x] **Unlock Logic**: Tambahkan validasi pada backend/frontend agar tombol ujian hanya aktif jika status `StudentProgress` untuk ke-14 sesi pertemuan telah bernilai `isCompleted: true`.
    *   [x] **Deteksi Kelas Ujian**: Menambahkan pendeteksian otomatis kelas pada `UjianPage.tsx`. Jika diakses tanpa parameter `courseId` (misal dari sidebar), sistem otomatis mengarahkan ke ujian (jika hanya 1 kelas) atau menyajikan daftar kartu kelas pemilih (jika > 1 kelas).

---

## 2. 🤖 Auto-Correction Dashboard & AI Review Queue (Role: Asisten & Admin) [COMPLETED]
Sistem untuk memantau status koreksi otomatis oleh AI dan memberikan kendali kepada Admin atas kualitas soal hasil generate RAG.

*   **Halaman Frontend**:
    *   `src/pages/asisten/AutoCorrectionAsisten.tsx` ([AutoCorrectionAsisten.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/asisten/AutoCorrectionAsisten.tsx))
    *   `src/pages/admin/AutoCorrection.tsx` ([AutoCorrection.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/admin/AutoCorrection.tsx))
*   **Pekerjaan Rumah (To-Do)**:
    *   [x] **Asisten Dashboard Integration**:
        *   Hubungkan `AutoCorrectionAsisten.tsx` untuk memanggil API `GET /api/ai/stats-pg` yang sudah tersedia di backend untuk menggantikan mockup statistik dan tabel log pengerjaan mahasiswa.
    *   [x] **Admin Review Queue API & Logic**:
        *   [x] Tambahkan kolom status persetujuan (e.g. `isApproved` / `status` enum `PENDING`, `APPROVED`, `REJECTED`) pada model `Soal` di `schema.prisma`.
        *   [x] Buat endpoint `GET /api/admin/soal/queue` untuk mengambil daftar soal yang baru digenerate oleh AI dan berstatus `PENDING`.
        *   [x] Buat endpoint `POST /api/admin/soal/approve` dan `POST /api/admin/soal/reject` untuk memperbarui status soal tersebut.
        *   [x] Hubungkan UI `AutoCorrection.tsx` dengan endpoint-endpoint di atas.

---

## 🗄️ 3. Monitoring AI Knowledge Base (Role: Admin) [COMPLETED]
Layanan pemantauan sinkronisasi dokumen kurikulum ke dalam vector database (RAG).

*   **Halaman Frontend**:
    *   `src/pages/admin/AIKnowledge.tsx` ([AIKnowledge.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/admin/AIKnowledge.tsx))
*   **Kondisi Saat Ini**:
    *   Telah terintegrasi penuh dengan backend untuk pemantauan sinkronisasi secara real-time dan reindexasi AI.
*   **Pekerjaan Rumah (To-Do)**:
    *   [x] **Prisma Schema & Status Tracking**: Tambahkan field status sinkronisasi (e.g. `embeddingStatus` enum `WAITING`, `PROCESSING`, `SUCCESS`, `FAILED`) pada model `Materi`.
    *   [x] **Backend Router & Controller**:
        *   Buat endpoint `GET /api/admin/ai-knowledge/status` untuk mendapatkan riwayat sinkronisasi dokumen kurikulum.
    *   [x] **Frontend Binding**:
        *   Hubungkan halaman `AIKnowledge.tsx` agar membaca data status dari database secara real-time.
        *   Wiriing tombol *"Reindex Semua"* untuk mengirim request ke `POST /api/admin/ai-sync` yang sudah tersedia di backend.

---

## 📜 4. Rekap Laporan & Generate Sertifikat (Role: Admin) [COMPLETED]
Fitur kelulusan kursus global untuk mengevaluasi seluruh nilai mahasiswa dan menerbitkan sertifikat kelulusan.

*   **Halaman Frontend**:
    *   `src/pages/admin/LaporanAkhir.tsx` ([LaporanAkhir.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/admin/LaporanAkhir.tsx))
*   **Kondisi Saat Ini**:
    *   Tabel kelulusan kelas, nilai kumulatif (30% refleksi + 35% tugas + 35% ujian), pembuatan sertifikat digital, dan unduhan SVG aman terintegrasi backend penuh.
*   **Pekerjaan Rumah (To-Do)**:
    *   [x] **Backend Router & Controller**:
        *   Buat endpoint `GET /api/admin/laporan-akhir?courseId={id}`: Melakukan kalkulasi total nilai kumulatif mahasiswa (rata-rata nilai tugas refleksi + latihan PG + ujian akhir) dan menentukan status kelulusan (Lulus/Tidak Lulus).
        *   Buat endpoint `POST /api/admin/sertifikat/generate`: Mendaftarkan dan menghasilkan nomor sertifikat unik ke model `Sertifikat` di database.
        *   Buat endpoint `GET /api/admin/sertifikat/download/:id`: Mengunduh berkas sertifikat dalam format PDF/SVG.
    *   [x] **Frontend Binding**:
        *   Hubungkan tabel di `LaporanAkhir.tsx` untuk menampilkan daftar mahasiswa dan nilai riil berdasarkan response API.
        *   Integrasikan tombol *"Buat"* sertifikat dan *"Download Semua Sertifikat"* dengan endpoint backend yang sesuai.

---

## 🚧 5. Halaman Kosong / Menu Placeholder [COMPLETED]
Seluruh rute menu placeholder di `App.tsx` telah diselesaikan dengan integrasi riil atau dibersihkan (dihapus) sesuai batasan menu per-role:

*   **Mahasiswa (User)**:
    *   [x] `/register`: Pendaftaran peserta/mahasiswa baru (Selesai terintegrasi backend, menyimpan field `nama`, `email`, `instansi`, dan `password`).
    *   [x] `/user/profile`: Pengaturan profil mahasiswa (Selesai terintegrasi backend, mendukung pembaruan nama, email, instansi, dan ganti password).
    *   [x] Profil & Login Dinamis (Selesai menghubungkan `Sidebar` dan `Navbar` dengan store `useAuthStore` untuk menampilkan nama, gelar, dan avatar riil. Menambahkan daftar akun demo dinamis dari database pada halaman Login).
    *   [x] `/user/kursus-saya`: Daftar kursus aktif mahasiswa (Selesai terintegrasi store `usePendaftaranStore` & progres belajar).
    *   [x] `/user/materi`: Daftar arsip materi global (Dihapus dari menu/rute - Obsolete).
    *   [x] `/user/assignments`: Daftar penugasan (Dihapus dari menu/rute - Obsolete).
*   **Pengajar (Dosen)**:
    *   [x] `/pengajar/jadwal`: Jadwal mengajar dosen (Dihapus dari menu/rute - Obsolete).
*   **Asisten**:
    *   [x] `/asisten/jadwal`: Jadwal asisten (Dihapus dari menu/rute - Obsolete).


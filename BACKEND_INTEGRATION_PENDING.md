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

## 🗄️ 3. Monitoring AI Knowledge Base (Role: Admin)
Layanan pemantauan sinkronisasi dokumen kurikulum ke dalam vector database (RAG).

*   **Halaman Frontend**:
    *   `src/pages/admin/AIKnowledge.tsx` ([AIKnowledge.tsx](file:///c:/Users/agram/OneDrive/Pictures/Desktop/lms_skripsi/frontend/src/pages/admin/AIKnowledge.tsx))
*   **Kondisi Saat Ini**:
    *   Tabel status sinkronisasi per materi/modul didefinisikan secara statis.
    *   Tombol pemicu reindexasi global belum terhubung ke backend.
*   **Pekerjaan Rumah (To-Do)**:
    *   [ ] **Prisma Schema & Status Tracking**: Tambahkan field status sinkronisasi (e.g. `embeddingStatus` enum `WAITING`, `PROCESSING`, `SUCCESS`, `FAILED`) pada model `Materi`.
    *   [ ] **Backend Router & Controller**:
        *   Buat endpoint `GET /api/admin/ai-knowledge/status` untuk mendapatkan riwayat sinkronisasi dokumen kurikulum.
    *   [ ] **Frontend Binding**:
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

## 🚧 5. Halaman Kosong / Menu Placeholder
Beberapa rute di `App.tsx` masih diarahkan ke elemen `div` placeholder sederhana dan membutuhkan implementasi UI serta integrasi backend penuh:

*   **Mahasiswa (User)**:
    *   [x] `/user/kursus-saya`: Daftar kursus aktif yang sedang diikuti mahasiswa (Terintegrasi riil dengan store `usePendaftaranStore` & progres belajar).
    *   [ ] `/user/materi`: Daftar arsip materi global.
*   **Pengajar (Dosen)**:
    *   [ ] `/pengajar/jadwal`: Jadwal mengajar dosen yang bersangkutan (Hubungkan dengan model `Pertemuan` filter `dosenId`).
*   **Asisten**:
    *   [ ] `/asisten/jadwal`: Jadwal asisten mengawas/mengoreksi kelas (Hubungkan dengan model `Pertemuan` filter `asistenId`).


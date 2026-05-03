# 👥 User Flow per Role — Hybrid LMS

Dokumen ini menjelaskan alur lengkap setiap role yang ada di sistem Hybrid LMS berdasarkan rancangan skripsi.

---

## Daftar Role

| Role | Deskripsi Singkat |
|------|-------------------|
| 🔴 Admin Kursus | Mengelola seluruh siklus kursus dari awal hingga selesai |
| 🟡 Pengajar | Mengisi konten materi dan memonitor perkembangan peserta |
| 🟠 Asisten | Mengoreksi hasil kerja peserta |
| 🔵 Peserta | Mendaftar, mengikuti kursus, dan mengerjakan tugas |

---

## 🔴 Admin Kursus

Admin Kursus adalah pengelola utama sistem. Bertanggung jawab atas seluruh siklus hidup kursus dari persiapan hingga penutupan.

### Flow 1: Manajemen Pengajar

```
[Admin Login]
      │
      ▼
[Halaman Manajemen Pengajar]
      │
      ├── View Pengajar
      │       └── Lihat daftar: Nama, Nama Pelatihan, Jadwal Pelatihan
      │
      └── Add Pengajar
              ├── Input: Nama Lengkap
              ├── Input: Instansi
              ├── Input: Email
              └── System: Generate password pertama otomatis
                          → Pengajar menerima kredensial login
```

---

### Flow 2: Membuat Kursus Baru

```
[Admin Login]
      │
      ▼
[Add Kursus]
      │
      ├── Input: Nama Kursus
      │
      ▼
[Add Jadwal Pelaksanaan] ── per sesi materi
      │
      ├── Nama Kursus (referensi)
      ├── Waktu Pelaksanaan:
      │       ├── Strict (waktu tetap)
      │       ├── Range (rentang waktu)
      │       └── Free (bebas)
      ├── Nama Materi
      ├── Nama Pengajar (pilih dari daftar)
      ├── Nama Asisten (pilih dari daftar)
      ├── Jenis Pembelajaran:
      │       ├── Online Meeting (Zoom / Google Meet)
      │       ├── Micro Learning (video lokal, YouTube Short, TikTok)
      │       └── General Learning (PDF, dokumen)
      └── Bobot Materi (persentase penilaian)
```

---

### Flow 3: Menambahkan Materi

```
[Setelah Jadwal Dibuat]
      │
      ▼
[Add Materi] ── per nama materi dalam kursus
      │
      ├── Online Meeting:
      │       └── Input: Link Zoom Meeting
      │
      ├── Micro Learning:
      │       ├── Input: Link TikTok / YouTube Short
      │       └── Upload: Video lokal
      │
      └── General Learning:
              ├── Upload: File PDF materi
              ├── Upload: Refleksi Materi (Essay) → wajib
              └── Upload: Tugas Pilihan Ganda (10 soal) → opsional
                          │
                          ▼
                  [Add Ujian Akhir]
                          └── Input: 30 Soal Pilihan Ganda
```

---

### Flow 4: Publish Kursus

```
[Semua Materi Sudah Diisi]
      │
      ▼
[Publish Kursus]
      │
      └── Status kursus berubah: DRAFT → PUBLISHED
                │
                ▼
          Kursus muncul di halaman peserta
          Peserta bisa melakukan Enroll
```

---

### Flow 5: Menutup Kursus (End Kursus)

```
[Kursus Selesai Berjalan]
      │
      ▼
[End Kursus]
      │
      ▼
[Lihat Rekap Akhir]
      │
      └── View per peserta:
              ├── Nama Peserta
              ├── Nilai per Materi
              └── Status Kelulusan (Lulus / Tidak Lulus)
```

---

## 🟡 Pengajar

Pengajar bertugas mengisi konten materi yang sudah dijadwalkan oleh Admin dan memonitor perkembangan nilai peserta.

### Flow 1: Upload Konten Materi

```
[Pengajar Login]
  (menggunakan kredensial yang di-generate Admin)
      │
      ▼
[Halaman Kursus Saya]
      │
      ▼
[Pilih Materi] ── Nama materi sudah ditentukan oleh Admin
      │
      ├── Jika Online Meeting:
      │       ├── Input: Link Zoom Meeting
      │       └── Upload: Rekaman Zoom (setelah sesi selesai)
      │
      ├── Jika Micro Learning:
      │       ├── Input: Link TikTok / YouTube Short
      │       └── Upload: Video lokal
      │
      └── Jika General Learning:
              ├── Upload: File PDF materi
              ├── Upload: File Refleksi (Essay)
              └── Upload: Tugas Pilihan Ganda (opsional, 10 soal)
```

---

### Flow 2: Monitoring Peserta

```
[Pengajar Login]
      │
      ▼
[Halaman Monitoring]
      │
      ▼
[View Kursus yang Diajarkan]
      │
      └── Per Materi:
              ├── Nama Materi
              ├── Jenis Materi (Micro Learning / Zoom / General)
              └── List Mahasiswa:
                      ├── Nama Mahasiswa
                      ├── Nilai Tugas
                      └── Nilai Refleksi
```

---

## 🟠 Asisten

Asisten bertugas mengoreksi hasil pengerjaan peserta, baik refleksi (essay) maupun tugas/ujian yang memerlukan koreksi manual.

### Flow 1: Koreksi Hasil Peserta

```
[Asisten Login]
      │
      ▼
[Halaman Koreksi]
      │
      ▼
[View Daftar Koreksi]
      │
      ├── Filter berdasarkan:
      │       ├── Nama Kursus
      │       ├── Nama Materi
      │       └── Nama Dosen/Pengajar
      │
      ▼
[Pilih Peserta yang Akan Dikoreksi]
      │
      ├── Pilih Jenis Soal:
      │       ├── Refleksi (Essay)
      │       └── Tugas / Ujian (Pilihan Ganda)
      │
      └── Input Hasil Koreksi: nilai 0 – 100
                  │
                  ▼
          Nilai tersimpan → terupdate di rekap Admin & Pengajar
```

---

## 🔵 Peserta

Peserta adalah pengguna akhir yang mengikuti kursus, mengakses materi, dan mengerjakan semua bentuk penilaian.

### Flow 1: Registrasi Akun

```
[Buka Halaman Register]
      │
      ├── Input: Nama Lengkap
      ├── Input: Email
      ├── Input: Nomor WhatsApp
      ├── Input: Asal Instansi
      └── Input: Password (set sendiri)
                  │
                  ▼
          Akun berhasil dibuat → Redirect ke Login
```

---

### Flow 2: Manajemen Profil

```
[Peserta Login]
      │
      ▼
[Halaman Profil]
      │
      ├── Lihat: Nama, Email, Instansi
      └── Edit: Ganti Password
```

---

### Flow 3: Enroll Kursus

```
[Peserta Login]
      │
      ▼
[Halaman Daftar Kursus Tersedia]
      │
      └── Lihat per kursus:
              ├── Nama Kursus
              ├── Jadwal Kursus
              └── Deskripsi Singkat
                      │
                      ▼
              [Tombol Enroll]
                      │
                      ▼
              Kursus masuk ke [Kursus Saya]
```

---

### Flow 4: Mengakses & Mengerjakan Materi

```
[Peserta Login]
      │
      ▼
[Kursus Saya]
      │
      └── Lihat status kursus:
              ├── Berlangsung
              ├── Lulus
              ├── Tidak Lulus
              └── Mengulang
                      │
                      ▼
              [Pilih Kursus → View Materi]
                      │
                      ├── Micro Learning:
                      │       └── Tonton video (TikTok / YouTube Short / lokal)
                      │
                      ├── Online Meeting:
                      │       └── Buka Link Zoom / Tonton Rekaman Zoom
                      │
                      └── General Learning:
                              └── Baca / Download PDF materi
                                      │
                                      ▼
                              [Selesai Baca Materi]
                                      │
                                      ├── Submit Refleksi (Essay) ── wajib
                                      │
                                      ├── Kerjakan Tugas (10 PG) ── jika tersedia
                                      │
                                      └── Kerjakan Ujian Akhir (30 PG) ── jika tersedia
                                                      │
                                                      ▼
                                              [Lihat Hasil & Nilai]
```

---

### Flow 5: Melihat Hasil Nilai

```
[Peserta Login]
      │
      ▼
[Kursus Saya → Pilih Kursus]
      │
      ▼
[View Nilai per Materi]
      │
      ├── Nilai Refleksi
      ├── Nilai Tugas
      ├── Nilai Ujian
      └── Status Kelulusan per Materi
```

---

## 🤖 Modul AI (Lintas Role)

Modul AI bekerja di balik layar mendukung semua role. Alur pemrosesan AI:

### Alur RAG Pipeline

```
[Materi Diunggah oleh Pengajar / Admin]
      │
      ▼
[Ekstraksi Konten]
      │
      ├── PDF → ekstrak teks langsung
      ├── Video Lokal / Zoom → transkripsi audio ke teks
      └── Link YouTube Short / TikTok → transkripsi audio ke teks
                      │
                      ▼
              [Chunking Teks]
              (pecah teks menjadi potongan kecil)
                      │
                      ▼
              [Embedding via NVIDIA NIM]
              (konversi teks → vektor numerik)
                      │
                      ▼
              [Simpan ke pgvector]
              (tabel ai_embeddings)
```

### Alur Chatbot RAG (Peserta bertanya)

```
[Peserta Input Pertanyaan]
      │
      ▼
[Query di-embed → vektor]
      │
      ▼
[Similarity Search di pgvector]
(cari chunk materi yang paling relevan)
      │
      ▼
[Chunk relevan + pertanyaan dikirim ke SLM via NVIDIA NIM]
      │
      ▼
[SLM menghasilkan jawaban kontekstual]
      │
      ▼
[Jawaban ditampilkan ke Peserta]
```

### Alur Generate Soal Otomatis

```
[Admin / Pengajar request generate soal]
      │
      ▼
[Ambil chunk materi dari pgvector]
      │
      ▼
[Kirim ke SLM dengan prompt instruksi pembuatan soal]
      │
      ▼
[SLM menghasilkan soal pilihan ganda]
      │
      ▼
[Soal tersimpan di tabel ujian / tugas]
      └── Admin bisa review & edit sebelum dipublish
```

---

## 🔐 Ringkasan Akses per Role

| Fitur | Admin | Pengajar | Asisten | Peserta |
|-------|:-----:|:--------:|:-------:|:-------:|
| Kelola Pengajar | ✅ | ❌ | ❌ | ❌ |
| Buat Kursus & Jadwal | ✅ | ❌ | ❌ | ❌ |
| Tambah & Publish Materi | ✅ | ✅ | ❌ | ❌ |
| Upload Konten Materi | ✅ | ✅ | ❌ | ❌ |
| Koreksi Refleksi & Tugas | ❌ | ❌ | ✅ | ❌ |
| Monitoring Nilai Peserta | ✅ | ✅ | ❌ | ❌ |
| Enroll Kursus | ❌ | ❌ | ❌ | ✅ |
| Akses & Kerjakan Materi | ❌ | ❌ | ❌ | ✅ |
| Submit Refleksi & Tugas | ❌ | ❌ | ❌ | ✅ |
| Lihat Nilai Sendiri | ❌ | ❌ | ❌ | ✅ |
| End Kursus & Rekap Nilai | ✅ | ❌ | ❌ | ❌ |
| Akses Chatbot AI | ❌ | ❌ | ❌ | ✅ |
| Generate Soal AI | ✅ | ✅ | ❌ | ❌ |

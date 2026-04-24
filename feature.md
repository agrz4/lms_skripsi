# 📚 Hybrid Learning Management System (LMS)

Sistem LMS Hybrid berbasis web yang mendukung berbagai metode pembelajaran (Online Meeting, Micro Learning, General Learning) dilengkapi dengan Modul AI berbasis RAG menggunakan pgvector.

> Skripsi 2026 — Universitas Gunadarma  
> Pembimbing: Dr. Koko Bachrudin., S.Kom., MMSI

---

## 🧱 Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + pgvector |
| AI / RAG | NVIDIA NIM (SLM) + pgvector |
| Auth | JWT (JSON Web Token) |
| File Storage | Local / S3-compatible |

---

## 📁 Struktur Proyek

```
lms-hybrid/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/      # Komponen reusable
│       ├── pages/
│       │   ├── auth/        # Login, Register
│       │   ├── admin/       # Halaman Admin Kursus
│       │   ├── pengajar/    # Halaman Pengajar
│       │   ├── asisten/     # Halaman Asisten
│       │   └── peserta/     # Halaman Peserta
│       ├── hooks/
│       ├── services/        # API calls (axios)
│       ├── store/           # State management
│       └── utils/
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # DB config, env, constants
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── kursusController.js
│   │   │   ├── materiController.js
│   │   │   ├── ujianController.js
│   │   │   ├── nilaiController.js
│   │   │   └── aiController.js
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js
│   │   │   └── roleMiddleware.js
│   │   ├── models/          # Query functions / ORM
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── kursusRoutes.js
│   │   │   ├── materiRoutes.js
│   │   │   ├── ujianRoutes.js
│   │   │   ├── nilaiRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── ragService.js        # RAG pipeline
│   │   │   ├── embeddingService.js  # Embedding teks ke vektor
│   │   │   └── transcriptService.js # Transkripsi video/audio
│   │   ├── uploads/         # File upload sementara
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── db/
│   ├── migrations/          # SQL migration files
│   └── seeds/               # Data awal / dummy
│
└── docker-compose.yml       # PostgreSQL + pgvector
```

---

## ⚙️ Prasyarat

Pastikan sudah terinstall:

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v15+
- [pgvector](https://github.com/pgvector/pgvector) extension
- [Docker](https://www.docker.com/) *(opsional, untuk setup DB cepat)*

---

## 🚀 Setup & Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/lms-hybrid.git
cd lms-hybrid
```

### 2. Setup Database dengan Docker (Rekomendasi)

```bash
docker-compose up -d
```

Atau setup manual PostgreSQL + pgvector:

```sql
-- Jalankan di psql setelah PostgreSQL terinstall
CREATE DATABASE lms_hybrid;
\c lms_hybrid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Setup Backend (Express)

```bash
cd server
cp .env.example .env
npm install
```

Edit file `.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lms_hybrid
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=50mb

# NVIDIA NIM (AI Module)
NIM_API_URL=https://integrate.api.nvidia.com/v1
NIM_API_KEY=your_nvidia_nim_api_key
NIM_MODEL=meta/llama-3.1-8b-instruct
EMBEDDING_MODEL=nvidia/nv-embedqa-e5-v5

# Embedding
VECTOR_DIMENSION=1024
```

Jalankan migrasi database:

```bash
npm run migrate
```

*(Opsional)* Jalankan seed data dummy:

```bash
npm run seed
```

Jalankan server:

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:5000`

### 4. Setup Frontend (React)

```bash
cd client
cp .env.example .env
npm install
```

Edit file `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LMS Hybrid
```

Jalankan frontend:

```bash
# Development
npm run dev

# Build production
npm run build
```

Frontend berjalan di `http://localhost:5173`

---

## 🗄️ Skema Database

### Setup pgvector untuk Modul AI

```sql
-- Aktifkan extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabel penyimpanan embedding dokumen
CREATE TABLE ai_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materi_id UUID REFERENCES materi(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  embedding vector(1024),     -- sesuaikan dimensi model
  chunk_index INTEGER,
  sumber VARCHAR(20),         -- 'pdf', 'video', 'zoom'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk similarity search (cosine distance)
CREATE INDEX ON ai_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

Tabel utama lainnya tersedia di folder `db/migrations/`.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Deskripsi | Role |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Registrasi peserta baru | Public |
| POST | `/api/auth/login` | Login semua role | Public |
| GET | `/api/auth/me` | Data user login | All |

### Admin Kursus
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/kursus` | List semua kursus |
| POST | `/api/kursus` | Buat kursus baru |
| POST | `/api/kursus/:id/jadwal` | Tambah jadwal pelaksanaan |
| POST | `/api/kursus/:id/materi` | Tambah materi ke kursus |
| PUT | `/api/kursus/:id/publish` | Publish kursus |
| PUT | `/api/kursus/:id/end` | Selesaikan kursus |
| POST | `/api/pengajar` | Tambah pengajar baru |

### Peserta
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/kursus/available` | Kursus yang tersedia |
| POST | `/api/kursus/:id/enroll` | Enroll kursus |
| GET | `/api/peserta/kursus` | Kursus yang diikuti |
| GET | `/api/materi/:id` | Akses materi |
| POST | `/api/materi/:id/refleksi` | Submit refleksi |
| POST | `/api/ujian/:id/submit` | Submit jawaban ujian |

### Asisten
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/koreksi` | List pengumpulan yang perlu dikoreksi |
| PUT | `/api/koreksi/refleksi/:id` | Input nilai refleksi |

### Pengajar
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/pengajar/kursus` | Kursus yang diajarkan |
| PUT | `/api/materi/:id/upload` | Upload konten materi |
| GET | `/api/pengajar/monitoring` | Monitoring nilai peserta |

### Modul AI
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/ai/embed/:materi_id` | Proses embedding materi |
| POST | `/api/ai/chat` | Chat dengan RAG chatbot |
| POST | `/api/ai/generate-soal/:materi_id` | Generate soal dari materi |
| POST | `/api/ai/transcript` | Transkripsi video ke teks |

---

## ✨ Fitur Utama

### Role: Admin Kursus
- Manajemen pengajar (tambah, lihat daftar, generate password)
- Buat dan kelola kursus beserta jadwal pelaksanaan
- Pengaturan bobot materi dan jenis pembelajaran per sesi
- Publish dan menutup kursus
- Lihat rekap nilai & status kelulusan seluruh peserta

### Role: Pengajar
- Upload konten materi sesuai jenis:
  - 🎥 **Online Meeting** — link/rekaman Zoom
  - 📱 **Micro Learning** — link TikTok, YouTube Short, atau upload video lokal
  - 📄 **General Learning** — upload file PDF
- Monitoring nilai tugas dan refleksi peserta per materi

### Role: Asisten
- Koreksi refleksi (essay) peserta dengan input nilai 0–100
- Lihat status pengumpulan per kursus dan per materi

### Role: Peserta
- Register dan enroll kursus yang tersedia
- Akses materi sesuai jadwal
- Submit refleksi materi (essay)
- Kerjakan tugas pilihan ganda (opsional, 10 soal)
- Kerjakan ujian akhir (30 soal pilihan ganda)
- Lihat nilai dan status kelulusan per materi

### Modul AI (RAG + SLM)
- Transkripsi otomatis konten video dan PDF menjadi teks
- Embedding teks ke pgvector menggunakan NVIDIA NIM
- Chatbot berbasis RAG yang menjawab berdasarkan materi kursus
- Generate soal ujian/tugas otomatis dari materi
- Koreksi otomatis jawaban refleksi (auto correction)

---

## 🐳 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: lms_postgres
    environment:
      POSTGRES_DB: lms_hybrid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d

volumes:
  pgdata:
```

---

## 👥 Tim Pengembang

| Nama | Role | Modul |
|------|------|-------|
| *(Nama)* | Informatika | Modul Mahasiswa (Frontend Peserta) |
| *(Nama)* | Informatika | Modul Pengelola (Admin, Pengajar, Asisten) |
| *(Nama)* | Informatika | Modul Kecerdasan Artifisial (RAG + AI) |
| *(Nama)* | Sistem Informasi | UI/UX Designer |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan Skripsi Universitas Gunadarma 2026.

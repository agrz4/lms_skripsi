# 📚 LMS Hybrid - Modul Kecerdasan Artifisial (RAG)

Dokumentasi setup project dan implementasi modul AI menggunakan Retrieval-Augmented Generation (RAG) untuk evaluasi soal pada Learning Management System (LMS).

---

## 🗂️ Struktur Project

```
lms-hybrid/
├── frontend/                   # React + Vite
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── ai/
│   │   │       ├── EvaluasiSoal.jsx
│   │   │       └── HasilEvaluasi.jsx
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── aiService.js
│   │   └── App.jsx
│   ├── .env
│   └── package.json
│
├── backend/                    # Express.js
│   ├── src/
│   │   ├── controllers/
│   │   │   └── aiController.js
│   │   ├── routes/
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── embeddingService.js
│   │   │   ├── ragService.js
│   │   │   └── evaluasiService.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Express.js |
| ORM | Prisma |
| Database | PostgreSQL (via Supabase) |
| Vector DB | Supabase pgvector |
| Embedding | OpenAI `text-embedding-3-small` |
| LLM | OpenAI `gpt-4o-mini` |
| Auth | JWT + bcrypt |

---

## 🔧 Prerequisites

Pastikan tools berikut sudah terinstall di komputer:

- [Node.js](https://nodejs.org/) v18 atau lebih baru
- [npm](https://www.npmjs.com/) v9 atau lebih baru
- [Git](https://git-scm.com/)
- Akun [Supabase](https://supabase.com/) (gratis)
- Akun [OpenAI](https://platform.openai.com/) (untuk API key)

---

## 🚀 Setup Project

### 1. Clone Repository

```bash
git clone https://github.com/username/lms-hybrid.git
cd lms-hybrid
```

---

### 2. Setup Supabase

#### a. Buat Project Baru di Supabase
1. Login ke [supabase.com](https://supabase.com/)
2. Klik **New Project**
3. Isi nama project, password database, dan pilih region terdekat
4. Tunggu project selesai dibuat

#### b. Aktifkan Extension pgvector
Buka **SQL Editor** di dashboard Supabase, lalu jalankan:

```sql
-- Aktifkan extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

#### c. Buat Tabel untuk RAG
Masih di SQL Editor, jalankan query berikut:

```sql
-- Tabel untuk menyimpan soal beserta vector embedding-nya
CREATE TABLE soal_vectors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  soal_id UUID NOT NULL,
  mata_kuliah_id UUID,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat pencarian similarity
CREATE INDEX ON soal_vectors
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function untuk similarity search
CREATE OR REPLACE FUNCTION match_soal(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_mata_kuliah UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  soal_id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sv.id,
    sv.soal_id,
    sv.content,
    sv.metadata,
    1 - (sv.embedding <=> query_embedding) AS similarity
  FROM soal_vectors sv
  WHERE
    1 - (sv.embedding <=> query_embedding) > match_threshold
    AND (filter_mata_kuliah IS NULL OR sv.mata_kuliah_id = filter_mata_kuliah)
  ORDER BY sv.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

#### d. Ambil Credentials Supabase
Buka **Project Settings > API**, catat:
- `Project URL`
- `anon public` key
- `service_role` key (untuk backend)

---

### 3. Setup Backend (Express.js)

#### a. Install Dependencies

```bash
cd backend
npm install
```

#### b. Buat file `.env`

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Supabase
SUPABASE_URL=https://[PROJECT_REF].supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

#### c. Setup Prisma

```bash
# Inisialisasi Prisma (skip jika sudah ada schema.prisma)
npx prisma init

# Jalankan migrasi database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

#### d. Contoh `schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id        String   @id @default(uuid())
  nama      String
  email     String   @unique
  password  String
  role      Role     @default(MAHASISWA)
  createdAt DateTime @default(now())
  soal      Soal[]
}

model MataKuliah {
  id        String   @id @default(uuid())
  nama      String
  kode      String   @unique
  createdAt DateTime @default(now())
  soal      Soal[]
}

model Soal {
  id           String     @id @default(uuid())
  pertanyaan   String
  tipesoal     TipeSoal
  mataKuliahId String
  mataKuliah   MataKuliah @relation(fields: [mataKuliahId], references: [id])
  dibuatOleh   String
  pembuat      User       @relation(fields: [dibuatOleh], references: [id])
  createdAt    DateTime   @default(now())
  evaluasi     Evaluasi[]
}

model Evaluasi {
  id           String   @id @default(uuid())
  soalId       String
  soal         Soal     @relation(fields: [soalId], references: [id])
  skorKualitas Float
  tingkatKesulitan String
  isDuplikat   Boolean  @default(false)
  saranPerbaikan String?
  createdAt    DateTime @default(now())
}

enum Role {
  MAHASISWA
  DOSEN
  ADMIN
}

enum TipeSoal {
  PILIHAN_GANDA
  ESSAY
  BENAR_SALAH
}
```

#### e. Install Dependencies Backend

```bash
npm install express prisma @prisma/client @supabase/supabase-js openai jsonwebtoken bcryptjs cors dotenv
npm install --save-dev nodemon
```

#### f. Jalankan Backend

```bash
# Development
npm run dev

# Production
npm start
```

---

### 4. Setup Frontend (React + Vite)

#### a. Install Dependencies

```bash
cd frontend
npm install
```

#### b. Buat file `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=LMS Hybrid
```

#### c. Install Dependencies Frontend

```bash
npm install axios react-router-dom tailwindcss @tailwindcss/vite
```

#### d. Jalankan Frontend

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

## 🤖 Implementasi Modul AI (RAG)

### Arsitektur RAG

```
[Dosen Input Soal]
       ↓
[Express Backend]
       ↓
[Embedding Service] → Convert teks ke vector (OpenAI)
       ↓
[Supabase pgvector] → Simpan & cari soal serupa
       ↓
[RAG Service] → Retrieve konteks soal serupa
       ↓
[LLM Service] → Generate evaluasi dengan GPT-4o-mini
       ↓
[Hasil Evaluasi] → Kirim ke React Frontend
```

---

### File: `backend/src/services/embeddingService.js`

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Mengubah teks soal menjadi vector embedding
 * @param {string} text - Teks soal
 * @returns {Array} - Array vector embedding (1536 dimensi)
 */
const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Gagal membuat embedding untuk soal');
  }
};

module.exports = { generateEmbedding };
```

---

### File: `backend/src/services/ragService.js`

```javascript
const { createClient } = require('@supabase/supabase-js');
const { generateEmbedding } = require('./embeddingService');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Menyimpan soal beserta embedding-nya ke vector database
 * @param {string} soalId - ID soal dari database utama
 * @param {string} content - Teks soal
 * @param {string} mataKuliahId - ID mata kuliah
 * @param {object} metadata - Data tambahan (tipe soal, dll)
 */
const indexSoal = async (soalId, content, mataKuliahId, metadata = {}) => {
  try {
    const embedding = await generateEmbedding(content);

    const { data, error } = await supabase
      .from('soal_vectors')
      .upsert({
        soal_id: soalId,
        mata_kuliah_id: mataKuliahId,
        content,
        embedding,
        metadata,
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error indexing soal:', error);
    throw new Error('Gagal menyimpan soal ke vector database');
  }
};

/**
 * Mencari soal yang mirip menggunakan similarity search
 * @param {string} queryText - Teks soal yang ingin dicari kemiripannya
 * @param {number} threshold - Batas minimum similarity (0-1)
 * @param {number} limit - Jumlah maksimum hasil
 * @param {string} mataKuliahId - Filter berdasarkan mata kuliah (opsional)
 */
const cariSoalSerupa = async (queryText, threshold = 0.75, limit = 5, mataKuliahId = null) => {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    const { data, error } = await supabase.rpc('match_soal', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_mata_kuliah: mataKuliahId,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error mencari soal serupa:', error);
    throw new Error('Gagal melakukan pencarian soal serupa');
  }
};

module.exports = { indexSoal, cariSoalSerupa };
```

---

### File: `backend/src/services/evaluasiService.js`

```javascript
const OpenAI = require('openai');
const { cariSoalSerupa } = require('./ragService');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Mengevaluasi kualitas soal menggunakan RAG + LLM
 * @param {string} soal - Teks soal yang akan dievaluasi
 * @param {string} mataKuliah - Nama mata kuliah
 * @param {string} tipeSoal - Tipe soal (essay/pilihan_ganda/dll)
 * @param {string} mataKuliahId - ID mata kuliah untuk filter
 */
const evaluasiSoal = async (soal, mataKuliah, tipeSoal, mataKuliahId = null) => {
  try {
    // Step 1: Retrieve soal serupa dari vector database (RAG)
    const soalSerupa = await cariSoalSerupa(soal, 0.75, 5, mataKuliahId);

    // Step 2: Siapkan konteks dari soal serupa
    const konteksSoalSerupa = soalSerupa.length > 0
      ? soalSerupa
          .map((s, i) => `${i + 1}. "${s.content}" (similarity: ${(s.similarity * 100).toFixed(1)}%)`)
          .join('\n')
      : 'Tidak ada soal serupa yang ditemukan.';

    // Step 3: Kirim ke LLM untuk evaluasi
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `Kamu adalah evaluator soal akademik yang berpengalaman.
Tugasmu adalah mengevaluasi kualitas soal berdasarkan kriteria berikut:
1. Kejelasan pertanyaan (apakah mudah dipahami)
2. Tingkat kesulitan (mudah/sedang/sulit)
3. Kesesuaian dengan konteks akademik
4. Potensi duplikasi dengan soal yang sudah ada

Berikan respons dalam format JSON dengan struktur:
{
  "skorKualitas": <angka 1-10>,
  "tingkatKesulitan": "<mudah|sedang|sulit>",
  "isDuplikat": <true|false>,
  "analisis": "<penjelasan singkat evaluasi>",
  "saranPerbaikan": "<saran perbaikan soal jika diperlukan, atau null jika sudah baik>"
}

Hanya balas dengan JSON, tanpa teks tambahan.`,
        },
        {
          role: 'user',
          content: `Mata Kuliah: ${mataKuliah}
Tipe Soal: ${tipeSoal}
Soal yang dievaluasi: "${soal}"

Soal serupa yang sudah ada di database:
${konteksSoalSerupa}

Berikan evaluasi untuk soal di atas.`,
        },
      ],
    });

    // Step 4: Parse hasil evaluasi
    const rawResult = response.choices[0].message.content.trim();
    const hasil = JSON.parse(rawResult);

    return {
      ...hasil,
      soalSerupa: soalSerupa.map((s) => ({
        content: s.content,
        similarity: parseFloat((s.similarity * 100).toFixed(1)),
      })),
    };
  } catch (error) {
    console.error('Error evaluasi soal:', error);
    throw new Error('Gagal melakukan evaluasi soal');
  }
};

module.exports = { evaluasiSoal };
```

---

### File: `backend/src/controllers/aiController.js`

```javascript
const { evaluasiSoal } = require('../services/evaluasiService');
const { indexSoal } = require('../services/ragService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * POST /api/ai/evaluasi
 * Mengevaluasi kualitas soal menggunakan RAG
 */
const evaluasiSoalHandler = async (req, res) => {
  try {
    const { soalId, pertanyaan, mataKuliahId, mataKuliahNama, tipeSoal } = req.body;

    if (!pertanyaan || !mataKuliahId) {
      return res.status(400).json({
        success: false,
        message: 'Field pertanyaan dan mataKuliahId wajib diisi',
      });
    }

    // Jalankan evaluasi RAG
    const hasil = await evaluasiSoal(pertanyaan, mataKuliahNama, tipeSoal, mataKuliahId);

    // Simpan hasil evaluasi ke database
    if (soalId) {
      await prisma.evaluasi.create({
        data: {
          soalId,
          skorKualitas: hasil.skorKualitas,
          tingkatKesulitan: hasil.tingkatKesulitan,
          isDuplikat: hasil.isDuplikat,
          saranPerbaikan: hasil.saranPerbaikan,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: hasil,
    });
  } catch (error) {
    console.error('Error controller evaluasi:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

/**
 * POST /api/ai/index
 * Menyimpan soal ke vector database untuk keperluan RAG
 */
const indexSoalHandler = async (req, res) => {
  try {
    const { soalId, pertanyaan, mataKuliahId, tipeSoal } = req.body;

    if (!soalId || !pertanyaan || !mataKuliahId) {
      return res.status(400).json({
        success: false,
        message: 'Field soalId, pertanyaan, dan mataKuliahId wajib diisi',
      });
    }

    await indexSoal(soalId, pertanyaan, mataKuliahId, { tipeSoal });

    return res.status(200).json({
      success: true,
      message: 'Soal berhasil diindeks ke vector database',
    });
  } catch (error) {
    console.error('Error controller index:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};

module.exports = { evaluasiSoalHandler, indexSoalHandler };
```

---

### File: `backend/src/routes/aiRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const { evaluasiSoalHandler, indexSoalHandler } = require('../controllers/aiController');
const { authMiddleware, dosenOnly } = require('../middlewares/authMiddleware');

// POST /api/ai/evaluasi - Evaluasi soal menggunakan RAG
router.post('/evaluasi', authMiddleware, dosenOnly, evaluasiSoalHandler);

// POST /api/ai/index - Index soal ke vector database
router.post('/index', authMiddleware, dosenOnly, indexSoalHandler);

module.exports = router;
```

---

### File: `frontend/src/services/aiService.js`

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Mengirim soal untuk dievaluasi ke backend
 */
export const evaluasiSoal = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/ai/evaluasi`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * Mengindeks soal ke vector database
 */
export const indexSoal = async (payload) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/ai/index`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| `POST` | `/api/ai/evaluasi` | Evaluasi kualitas soal dengan RAG | Dosen |
| `POST` | `/api/ai/index` | Index soal ke vector database | Dosen |

### Contoh Request - Evaluasi Soal

```json
POST /api/ai/evaluasi
Content-Type: application/json
Authorization: Bearer <token>

{
  "soalId": "uuid-soal",
  "pertanyaan": "Jelaskan perbedaan antara stack dan queue dalam struktur data!",
  "mataKuliahId": "uuid-matkul",
  "mataKuliahNama": "Struktur Data",
  "tipeSoal": "ESSAY"
}
```

### Contoh Response - Evaluasi Soal

```json
{
  "success": true,
  "data": {
    "skorKualitas": 8.5,
    "tingkatKesulitan": "sedang",
    "isDuplikat": false,
    "analisis": "Soal sudah jelas dan sesuai dengan materi struktur data. Pertanyaan menuntut pemahaman konseptual yang baik.",
    "saranPerbaikan": "Pertimbangkan untuk menambahkan contoh penggunaan nyata agar lebih kontekstual.",
    "soalSerupa": [
      {
        "content": "Apa perbedaan LIFO dan FIFO dalam struktur data?",
        "similarity": 62.3
      }
    ]
  }
}
```

---

## 🔄 Alur Kerja Modul AI

```
1. Dosen membuat soal baru di LMS
         ↓
2. Frontend mengirim soal ke POST /api/ai/evaluasi
         ↓
3. Backend generate embedding soal (OpenAI)
         ↓
4. Cari soal serupa di Supabase pgvector
         ↓
5. Kirim soal + konteks soal serupa ke GPT-4o-mini
         ↓
6. LLM menghasilkan evaluasi (skor, kesulitan, duplikat, saran)
         ↓
7. Hasil disimpan ke tabel Evaluasi (Prisma/PostgreSQL)
         ↓
8. Frontend menampilkan hasil evaluasi ke Dosen
         ↓
9. Jika soal disetujui, index soal ke vector DB (POST /api/ai/index)
```

---

## 🧪 Testing API

Gunakan [Postman](https://www.postman.com/) atau [Thunder Client](https://www.thunderclient.com/) (VS Code extension).

### Langkah Testing:
1. Login dan dapatkan JWT token
2. Buat soal baru melalui endpoint soal
3. Kirim soal ke endpoint `/api/ai/evaluasi`
4. Cek hasil evaluasi yang dikembalikan
5. Jika soal valid, index ke vector DB via `/api/ai/index`

---

## ❗ Troubleshooting

| Error | Solusi |
|---|---|
| `OPENAI_API_KEY invalid` | Pastikan API key di `.env` valid dan memiliki kredit |
| `pgvector extension not found` | Jalankan `CREATE EXTENSION vector;` di Supabase SQL Editor |
| `Prisma migrate failed` | Cek `DATABASE_URL` di `.env`, pastikan password dan project ref benar |
| `CORS error` | Pastikan middleware CORS di Express sudah dikonfigurasi |
| `Embedding dimension mismatch` | Pastikan model embedding konsisten (`text-embedding-3-small` = 1536 dimensi) |

---

## 📦 Scripts

```bash
# Backend
npm run dev          # Jalankan server development (nodemon)
npm start            # Jalankan server production
npx prisma studio    # Buka GUI database Prisma

# Frontend
npm run dev          # Jalankan frontend development
npm run build        # Build untuk production
npm run preview      # Preview build production
```

---

## 👥 Kontribusi Tim

| Modul | Penanggung Jawab |
|---|---|
| UI/UX Design | Mahasiswa SI |
| Modul Mahasiswa | Mahasiswa IF |
| Modul Pengelola | Mahasiswa IF |
| **Modul AI (RAG)** | **Mahasiswa IF** |

---

## 📝 Catatan Penting

- Gunakan **model `gpt-4o-mini`** untuk menekan biaya API saat development
- **Simpan API key** di file `.env` dan pastikan file `.env` masuk ke `.gitignore`
- **Backup database** secara berkala selama pengembangan
- Untuk production, pertimbangkan menggunakan **rate limiting** pada endpoint AI untuk menghindari penggunaan API yang berlebihan

---

*Dokumentasi ini dibuat untuk keperluan Tugas Akhir / Skripsi — LMS Hybrid dengan Modul Kecerdasan Artifisial*

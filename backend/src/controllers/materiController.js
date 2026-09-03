const prisma = require('../config/db');
const { transcribeVideo } = require('../services/whisperService');
const { callOllama } = require('../services/ollamaService'); 
const { indexMateri } = require("../services/materiRagService");
const { siapkanKunciJawabanRefleksi } = require("../services/refleksiSoalService");
const { jalankanBerurutan } = require("../services/antrianAI");
const path = require("path");
const fs = require("fs");

const getAllMateri = async (req, res) => {
  const { mataKuliahId, pertemuanId } = req.query;
  try {
    const where = {};
    if (mataKuliahId) where.mataKuliahId = mataKuliahId;
    if (pertemuanId) where.pertemuanId = pertemuanId;

    const materi = await prisma.materi.findMany({
      where,
      include: {
        mataKuliah: true,
        pertemuan: true
      }
    });
    res.json(materi);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createMateri = async (req, res) => {
  const {
    nama,
    videoUrl,
    fileUrl,
    refleksi,
    pertemuanId,
    mataKuliahId
  } = req.body;


    console.log("Nama sebelum create:", nama);

  try {

    console.log("==================================");
    console.log("Nama sebelum disimpan:", nama);
    console.log("==================================");


    const materi = await prisma.materi.create({
        data: {
            nama,
            videoUrl,
            fileUrl,
            refleksi,
            pertemuanId,
            mataKuliahId
        }
    });

    console.log("==================================");
    console.log("Nama setelah create:", materi.nama);
    console.log("==================================");

    res.status(201).json(materi);

    // ==========================================================
    // PROSES AI DI LATAR BELAKANG
    //
    // Hanya SATU blok setImmediate. Versi sebelumnya memakai dua
    // blok terpisah (satu untuk video, satu untuk file), dan
    // keduanya memanggil indexMateri() secara bersamaan. Masing-
    // masing menjalankan materiVector.deleteMany() lalu membuat
    // chunk baru, sehingga yang selesai belakangan menghapus hasil
    // milik yang duluan.
    // ==========================================================

    setImmediate(() => jalankanBerurutan(`Materi: ${materi.nama}`, async () => {

        try {

            let materiTerkini = materi;

            // 1. Transkripsi dulu bila ada video.
            //    Harus lebih dulu, karena indexMateri membaca kolom
            //    transcript dari objek materi.
            if (materi.videoUrl) {
                materiTerkini = await processVideoMateri(materi);
            }

            // 2. Baru index SEKALI, mencakup PDF + video + transcript
            if (materi.fileUrl || materi.videoUrl) {

                console.log(`Memulai indexing: ${materi.nama}`);

                await indexMateri(materiTerkini);

                console.log(`Indexing selesai: ${materi.nama}`);
            }

            // 3. Siapkan soal refleksi + kunci jawabannya.
            //    Harus setelah indexing, karena pembuatan kunci jawaban
            //    mengambil knowledge dari MateriVector.
            try {

                await siapkanKunciJawabanRefleksi(materiTerkini);

            } catch (errKunci) {
                console.error("Gagal menyiapkan kunci jawaban refleksi:", errKunci.message);
            }

        } catch (err) {
            console.error("Background AI Error:", err);
        }
    }));

} catch (error) {
    console.error(error);
    res.status(400).json({
        message: error.message
    });
}
};

/**
 * Mengambil ringkasan sebagai TEKS dari keluaran Ollama.
 *
 * Prompt meminta bentuk { "ringkasan": "..." }, tetapi model kecil sering
 * mengembalikan bentuk lain: objek bersarang, array, atau kunci dengan nama
 * berbeda. Opsi format: "json" pada Ollama hanya menjamin keluarannya JSON
 * yang valid, bukan bentuknya.
 *
 * Bila nilai non-string diteruskan ke kolom bertipe String, Prisma
 * menganggapnya sebagai operator update dan melempar
 * "Unknown argument <isi teks>".
 *
 * Fungsi ini meratakan segala bentuk tersebut menjadi satu string.
 */
function ambilTeksRingkasan(result) {

  if (!result) return "";

  // Model kadang memakai nama kunci yang berbeda.
  const kandidat =
    result.ringkasan ??
    result.summary ??
    result.Ringkasan ??
    result;

  return ratakanMenjadiTeks(kandidat).trim();
}

function ratakanMenjadiTeks(nilai) {

  if (nilai === null || nilai === undefined) return "";

  if (typeof nilai === "string") return nilai;

  if (typeof nilai === "number" || typeof nilai === "boolean") {
    return String(nilai);
  }

  if (Array.isArray(nilai)) {
    return nilai
      .map(item => ratakanMenjadiTeks(item))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof nilai === "object") {

    // Bentuk yang pernah muncul:
    // { "kalimat pertama": "kalimat kedua", ... }
    // Kunci dan nilainya sama-sama bagian dari ringkasan, jadi keduanya diambil.
    const bagian = [];

    for (const [kunci, isi] of Object.entries(nilai)) {

      const teksKunci = kunci.trim();
      const teksIsi = ratakanMenjadiTeks(isi).trim();

      // Kunci yang hanya berupa label teknis tidak ikut ditulis.
      const labelTeknis = /^(ringkasan|summary|text|content|isi|value)$/i;

      if (teksKunci && !labelTeknis.test(teksKunci)) {
        bagian.push(teksKunci);
      }

      if (teksIsi) bagian.push(teksIsi);
    }

    return bagian.join(" ");
  }

  return "";
}

async function processVideoMateri(materi) {

  console.log(`🚀 Background AI dimulai untuk materi: ${materi.nama}`);

  if (!materi.videoUrl) {
    console.log("⏭️ Materi tidak memiliki video, transkripsi dilewati.");
    return materi;
  }

  console.log("🎥 Video ditemukan:", materi.videoUrl);

  const relativePath = materi.videoUrl
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^\/public/, "");

 const fullPath = path.join(
    __dirname,
    "../../public",
    relativePath
);

console.log("📂 Path Lokal:", fullPath);

if (!fs.existsSync(fullPath)) {
    throw new Error(`Video tidak ditemukan: ${fullPath}`);
}

console.log("🎙️ Memulai transkripsi...");

const transcript = await transcribeVideo(fullPath);

  console.log("✅ Transkripsi selesai.");

  console.log("🤖 Membuat ringkasan...");

  const summaryPrompt = `
Ringkas materi berikut.

Jawab HANYA dalam format JSON berikut:

{
  "ringkasan": "Isi ringkasan di sini"
}

Materi:

${transcript}
`;

  const result = await callOllama(summaryPrompt);

  console.log("=== RESULT OLLAMA ===");
  console.dir(result, { depth: null });

  const summary = ambilTeksRingkasan(result);

  if (!summary) {
    throw new Error("Ollama tidak mengembalikan field 'ringkasan'.");
  }

  console.log("✅ Ringkasan selesai.");

  const updatedMateri = await prisma.materi.update({
    where: {
      id: materi.id
    },
    data: {
      transcript: String(transcript || ""),
      summary
    }
  });

  console.log("💾 Transcript & ringkasan berhasil disimpan.");

  // Tidak memanggil indexMateri() di sini.
  // Indexing dijalankan sekali saja oleh pemanggil, setelah
  // transkripsi selesai, agar PDF dan video tidak saling menimpa.
  return updatedMateri;
}

const updateMateri = async (req, res) => {
  const { id } = req.params;
  const { nama, fileUrl, videoUrl, refleksi } = req.body;
  try {
    const materi = await prisma.materi.update({
      where: { id },
      data: {
        nama,
        fileUrl,
        videoUrl,
        refleksi
      }
    });
    res.json(materi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMateri = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.materi.delete({ where: { id } });
    res.json({ message: 'Materi deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Tidak ada file video yang di-upload"
    });
  }

  try {

    const protocol = req.protocol;
    const host = req.get("host");

    const fileUrl =
      `${protocol}://${host}/public/uploads/videos/${req.file.filename}`;


    // ==========================
    // TIDAK MENYIMPAN DATABASE
    // ==========================

    console.log("✅ Upload video selesai.");

    return res.json({
      success: true,
      message: "Video berhasil di-upload.",
      fileUrl
});

  } catch (error) {

    console.error(
      "Upload Video Error:",
      error
    );

    res.status(500).json({
      message: error.message
    });

  }
};

const uploadSubmateri = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Tidak ada file dokumen yang di-upload' });
  }
  try {
    const protocol = req.protocol;
    const host = req.get('host');
    const fileUrl = `${protocol}://${host}/public/uploads/documents/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Dokumen sub-materi berhasil di-upload',
      fileUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLatihanPG = async (req, res) => {
  const { mataKuliahId, pertemuanId, pertanyaan, soalList } = req.body;
  
  if (!mataKuliahId) {
    return res.status(400).json({ message: 'mataKuliahId wajib diisi' });
  }
  
  try {
    // Clear old choice questions for this session to prevent duplicates
    if (pertemuanId) {
      const existingSoal = await prisma.soal.findMany({
        where: { pertemuanId, tipesoal: 'PILIHAN_GANDA' }
      });
      const existingSoalIds = existingSoal.map(s => s.id);
      if (existingSoalIds.length > 0) {
        await prisma.soalVector.deleteMany({
          where: { soalId: { in: existingSoalIds } }
        });
        await prisma.evaluasi.deleteMany({
          where: { soalId: { in: existingSoalIds } }
        });
        await prisma.soal.deleteMany({
          where: { id: { in: existingSoalIds } }
        });
      }
    }

    const { indexSoal } = require('../services/ragService');
    const createdSoalList = [];
    
    if (soalList && Array.isArray(soalList)) {
      for (const item of soalList) {
        const qText = typeof item.pertanyaan === 'object' ? JSON.stringify(item.pertanyaan) : item.pertanyaan;
        const soal = await prisma.soal.create({
          data: {
            pertanyaan: qText,
            tipesoal: 'PILIHAN_GANDA',
            mataKuliahId,
            pertemuanId: pertemuanId || null,
            dibuatOleh: req.user.id
          }
        });
        
        try {
          await indexSoal(soal.id, qText, soal.mataKuliahId, { tipeSoal: 'PILIHAN_GANDA' });
        } catch (err) {
          console.error('Failed to index soal to RAG:', err);
        }
        createdSoalList.push(soal);
      }
    } else {
      if (!pertanyaan) {
        return res.status(400).json({ message: 'pertanyaan atau soalList wajib diisi' });
      }
      
      const qText = typeof pertanyaan === 'object' ? JSON.stringify(pertanyaan) : pertanyaan;
      const soal = await prisma.soal.create({
        data: {
          pertanyaan: qText,
          tipesoal: 'PILIHAN_GANDA',
          mataKuliahId,
          pertemuanId: pertemuanId || null,
          dibuatOleh: req.user.id
        }
      });
      
      try {
        await indexSoal(soal.id, qText, soal.mataKuliahId, { tipeSoal: 'PILIHAN_GANDA' });
      } catch (err) {
        console.error('Failed to index soal to RAG:', err);
      }
      createdSoalList.push(soal);
    }
    
    res.status(201).json({
      success: true,
      message: 'Soal latihan pilihan ganda berhasil disimpan dan diindeks',
      data: createdSoalList
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getLatihanPG = async (req, res) => {
  const { pertemuanId } = req.query;
  if (!pertemuanId) {
    return res.status(400).json({ message: 'pertemuanId wajib diisi' });
  }
  try {
    const soal = await prisma.soal.findMany({
      where: {
        pertemuanId,
        tipesoal: 'PILIHAN_GANDA'
      }
    });
    res.json(soal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getAllMateri, 
  createMateri, 
  updateMateri, 
  deleteMateri,
  uploadVideo,
  uploadSubmateri,
  createLatihanPG,
  getLatihanPG
};
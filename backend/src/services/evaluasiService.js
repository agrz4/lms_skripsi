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

const { GoogleGenAI } = require('@google/genai');
const { cariSoalSerupa } = require('./ragService');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Mengevaluasi kualitas soal menggunakan RAG + Google Gemini
 */
const evaluasiSoal = async (soal, mataKuliah, tipeSoal, mataKuliahId = null) => {
  try {
    const soalSerupa = await cariSoalSerupa(soal, 0.75, 5, mataKuliahId);

    const konteksSoalSerupa = soalSerupa.length > 0
      ? soalSerupa
          .map((s, i) => `${i + 1}. "${s.content}" (similarity: ${(s.similarity * 100).toFixed(1)}%)`)
          .join('\n')
      : 'Tidak ada soal serupa yang ditemukan.';

    const prompt = `Kamu adalah evaluator soal akademik yang berpengalaman.
Tugasmu adalah mengevaluasi kualitas soal. Berikan respons dalam format JSON.
Mata Kuliah: ${mataKuliah}
Tipe Soal: ${tipeSoal}
Soal yang dievaluasi: "${soal}"
Soal serupa: ${konteksSoalSerupa}
Berikan evaluasi dalam JSON.`;

    // Menggunakan model Flash terbaru yang sukses pada testing sebelumnya
    const response = await ai.models.generateContent({
      model: 'models/gemini-flash-latest',
      contents: [{ parts: [{ text: prompt }] }],
    });
    
    const rawResult = response.text.trim().replace(/```json|```/g, '');
    const hasil = JSON.parse(rawResult);

    return {
      ...hasil,
      soalSerupa: soalSerupa.map((s) => ({
        content: s.content,
        similarity: parseFloat((s.similarity * 100).toFixed(1)),
      })),
    };
  } catch (error) {
    console.error('Error evaluasi soal with Gemini:', error);
    throw new Error('Gagal melakukan evaluasi soal menggunakan Gemini: ' + error.message);
  }
};

module.exports = { evaluasiSoal };

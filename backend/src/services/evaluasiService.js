const { callOllama } = require('./ollamaService');
const { cariSoalSerupa } = require('./ragService');

/**
 * Mengevaluasi kualitas soal menggunakan RAG + Ollama (Gemma 4)
 */
const evaluasiSoal = async (soal, mataKuliah, tipeSoal, mataKuliahId = null) => {
  try {
    const soalSerupa = await cariSoalSerupa(soal, 0.75, 5, mataKuliahId);

    const konteksSoalSerupa = soalSerupa.length > 0
      ? soalSerupa.map((s, i) => `${i + 1}. "${s.content}" (similarity: ${(s.similarity * 100).toFixed(1)}%)`).join('\n')
      : 'Tidak ada soal serupa yang ditemukan.';

    const prompt = `Kamu adalah evaluator soal akademik yang berpengalaman.
Tugasmu adalah mengevaluasi kualitas soal. Berikan respons dalam format JSON.
Mata Kuliah: ${mataKuliah}
Tipe Soal: ${tipeSoal}
Soal yang dievaluasi: "${soal}"
Soal serupa: ${konteksSoalSerupa}
Berikan evaluasi dalam JSON.`;

    const hasil = await callOllama(prompt);

    return {
      ...hasil,
      soalSerupa: soalSerupa.map((s) => ({
        content: s.content,
        similarity: parseFloat((s.similarity * 100).toFixed(1)),
      })),
    };
  } catch (error) {
    console.error('Error evaluasi soal with Ollama:', error);
    throw new Error('Gagal evaluasi soal: ' + error.message);
  }
};

module.exports = { evaluasiSoal };
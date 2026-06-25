const prisma = require('../config/db');
const { generateEmbedding } = require('./embeddingService');

/**
 * Calculates cosine similarity between two numeric arrays
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Menyimpan soal beserta embedding-nya ke vector database (JSON stringified)
 * @param {string} soalId - ID soal dari database utama
 * @param {string} content - Teks soal
 * @param {string} mataKuliahId - ID mata kuliah
 * @param {object} metadata - Data tambahan (tipe soal, dll)
 */
const indexSoal = async (soalId, content, mataKuliahId, metadata = {}) => {
  try {
    const embedding = await generateEmbedding(content);
    
    // Debug: Cek jumlah dimensi
    console.log(`Debug Vector: Menghasilkan ${embedding.length} dimensi`);
    
    // Storing as JSON stringified array of numbers
    const result = await prisma.soalVector.upsert({
      where: { soalId },
      update: {
        content,
        embedding: JSON.stringify(embedding),
        metadata
      },
      create: {
        soalId,
        mataKuliahId,
        content,
        embedding: JSON.stringify(embedding),
        metadata
      }
    });

    return result;
  } catch (error) {
    console.error('Error indexing soal:', error);
    throw new Error('Gagal menyimpan soal ke vector database: ' + error.message);
  }
};

/**
 * Mencari soal yang mirip menggunakan similarity search di JavaScript
 * @param {string} queryText - Teks soal yang ingin dicari kemiripannya
 * @param {number} threshold - Batas minimum similarity (0-1)
 * @param {number} limit - Jumlah maksimum hasil
 * @param {string} mataKuliahId - Filter berdasarkan mata kuliah (opsional)
 */
const cariSoalSerupa = async (queryText, threshold = 0.75, limit = 5, mataKuliahId = null) => {
  try {
    const queryEmbedding = await generateEmbedding(queryText);

    // Fetch all vectors for the specified mataKuliah
    const allVectors = await prisma.soalVector.findMany({
      where: mataKuliahId ? { mataKuliahId } : {}
    });

    // Calculate similarity in memory
    const data = allVectors
      .map(v => {
        let vec;
        try {
          vec = JSON.parse(v.embedding);
        } catch (e) {
          vec = [];
        }
        const similarity = cosineSimilarity(queryEmbedding, vec);
        return {
          id: v.id,
          content: v.content,
          mataKuliahId: v.mataKuliahId,
          similarity
        };
      })
      .filter(r => r.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return data;
  } catch (error) {
    console.error('Error mencari soal serupa:', error);
    throw new Error('Gagal melakukan pencarian soal serupa: ' + error.message);
  }
};

module.exports = { indexSoal, cariSoalSerupa };


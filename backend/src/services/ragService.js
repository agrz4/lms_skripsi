const prisma = require('../config/db');
const { generateEmbedding } = require('./embeddingService');

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
    
    // Konversi array embedding ke format string vector untuk PostgreSQL
    const vectorString = `[${embedding.join(',')}]`;

    const result = await prisma.$executeRawUnsafe(
      `INSERT INTO "SoalVector" (id, "soalId", "mataKuliahId", content, embedding, metadata)
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, $5)
       ON CONFLICT ("soalId") 
       DO UPDATE SET content = $3, embedding = $4::vector, metadata = $5`,
      soalId,
      mataKuliahId,
      content,
      vectorString,
      metadata
    );

    return result;
  } catch (error) {
    console.error('Error indexing soal:', error);
    throw new Error('Gagal menyimpan soal ke vector database: ' + error.message);
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
    const vectorString = `[${queryEmbedding.join(',')}]`;

    // Menggunakan cosine similarity (1 - distance)
    // '<=>' adalah operator cosine distance di pgvector
    const query = `
      SELECT 
        id, 
        content, 
        "mataKuliahId",
        1 - (embedding <=> $1::vector) as similarity
      FROM "SoalVector"
      WHERE 1 - (embedding <=> $1::vector) > $2
      ${mataKuliahId ? 'AND "mataKuliahId" = $3' : ''}
      ORDER BY similarity DESC
      LIMIT $${mataKuliahId ? '4' : '3'}
    `;

    const params = [vectorString, threshold];
    if (mataKuliahId) {
      params.push(mataKuliahId);
    }
    params.push(limit);

    const data = await prisma.$queryRawUnsafe(query, ...params);
    return data || [];
  } catch (error) {
    console.error('Error mencari soal serupa:', error);
    throw new Error('Gagal melakukan pencarian soal serupa: ' + error.message);
  }
};

module.exports = { indexSoal, cariSoalSerupa };


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

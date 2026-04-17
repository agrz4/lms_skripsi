const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Mengubah teks soal menjadi vector embedding menggunakan Google Gemini
 * @param {string} text - Teks soal
 * @returns {Array} - Array vector embedding (768 dimensi)
 */
const generateEmbedding = async (text) => {
  try {
    const result = await ai.models.embedContent({
      model: 'models/gemini-embedding-001',
      contents: [{ parts: [{ text }] }],
      config: {
        outputDimensionality: 768
      }
    });
    
    if (!result.embeddings || result.embeddings.length === 0) {
      throw new Error('No embeddings returned from Gemini');
    }
    
    return result.embeddings[0].values;
  } catch (error) {
    console.error('Error generating embedding with Gemini:', error);
    throw new Error('Gagal membuat embedding: ' + error.message);
  }
};

module.exports = { generateEmbedding };

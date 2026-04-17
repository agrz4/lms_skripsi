require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { generateEmbedding } = require('./src/services/embeddingService');

// Set secara eksplisit ke env yang diharapkan SDK
process.env.GOOGLE_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function testGemini() {
  console.log('--- 🧪 Memulai Testing Gemini ---');

  // 1. Test Embedding
  try {
    console.log('\n[1] Mengetes Embedding Service...');
    const text = 'Apa itu kecerdasan buatan?';
    const vector = await generateEmbedding(text);
    console.log(`✅ Sukses! Berhasil menghasilkan vector.`);
    console.log(`   Jumlah Dimensi: ${vector.length}`);
  } catch (err) {
    console.error('❌ Gagal di Embedding:', err.message);
  }

  // 2. Test Generative AI (LLM)
  try {
    console.log('\n[2] Mengetes Generative AI (LLM)...');
    
    // Langsung panggil generateContent tanpa models.get()
    const response = await ai.models.generateContent({
        model: 'models/gemini-flash-latest', // Alias yang merujuk ke versi Flash terbaru yang stabil
        contents: [{ parts: [{ text: 'Berikan satu kalimat singkat tentang teknologi.' }] }],
    });

    console.log(`✅ Sukses! Respon Gemini:`);
    console.log(`   "${response.text.trim()}"`);
  } catch (err) {
    console.error('❌ Gagal di LLM:', err.message);
  }

  console.log('\n--- 🏁 Testing Selesai ---');
}

testGemini();

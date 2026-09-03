// test-ai-connection.js
require('dotenv').config();
const { callOllama } = require('./src/services/ollamaService');

async function testConnection() {
  console.log('🧪 ===== TEST KONEKSI AI (OLLAMA) =====');
  
  // Baca model dari environment
  const model = process.env.OLLAMA_MODEL || 'gemma4:e2b';
  console.log(`📡 Model: ${model}`);
  console.log('📡 Mencoba menghubungi Ollama di localhost:11434...\n');

  try {
    const prompt = 'Sebutkan 3 warna dasar dalam bahasa Indonesia!';
    console.log(`📝 Prompt: "${prompt}"`);
    console.log('⏳ Menunggu respons...');

    const startTime = Date.now();
    const result = await callOllama(prompt, model); // <-- pakai variable model
    const duration = (Date.now() - startTime) / 1000;

    console.log('\n✅ ===== TEST BERHASIL =====');
    console.log(`⏱️  Waktu respons: ${duration.toFixed(2)} detik`);
    console.log('🤖 Respons AI:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ ===== TEST GAGAL =====');
    console.error('Pesan error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Solusi: Pastikan Ollama sedang berjalan!');
      console.error('   Jalankan: ollama serve');
    } else if (error.message.includes('404')) {
      console.error('\n💡 Solusi: Model tidak ditemukan!');
      console.error(`   Jalankan: ollama pull ${model}`);
      console.error('   Lalu cek dengan: ollama list');
    }
  }
}

testConnection();
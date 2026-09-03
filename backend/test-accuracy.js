// test-accuracy.js
require('dotenv').config();
const axios = require('axios');
const { performance } = require('perf_hooks');

// ================== KONFIGURASI ==================
const BASE_URL = 'http://localhost:5000/api';
const PERTEMUAN_ID = '0763528c-3589-4dda-b507-37b614d946ee'; 
const STUDENT_EMAIL = 'mhs@lms.com';      
const STUDENT_PASSWORD = 'password123';

// ================== TEST CASES ==================
const TEST_CASES = [
  {
    name: '✅ Jawaban SANGAT BAIK (panjang, mendalam)',
    content: 'Saya sangat memahami konsep OOP di JavaScript. Saya bisa menjelaskan inheritance, encapsulation, dan polymorphism dengan contoh kode. Saya sudah membuat project kecil menggunakan class dan constructor. Saya juga paham perbedaan antara prototype dan class di JavaScript.',
    expected: 'Tinggi (80-100)'
  },
  {
    name: '⚠️ Jawaban SEDANG (cukup, kurang mendalam)',
    content: 'Saya mengerti tentang function dan array, tapi masih bingung dengan callback dan promise. Saya pernah coba pakai async/await tapi masih error.',
    expected: 'Sedang (60-80)'
  },
  {
    name: '❌ Jawaban BURUK (pendek, tidak relevan)',
    content: 'Saya belajar JavaScript. Materinya lumayan.',
    expected: 'Rendah (0-60)'
  }
];

// ================== FUNGSI ==================
async function login() {
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email: STUDENT_EMAIL,
    password: STUDENT_PASSWORD
  });
  return res.data.token;
}

async function run() {
  console.log('🧪 ===== TEST AKURASI AI =====\n');
  
  const token = await login();
  console.log('✅ Login student berhasil\n');

  for (const test of TEST_CASES) {
    console.log(`📝 ${test.name}`);
    console.log(`   Konten: "${test.content.substring(0, 50)}..."`);
    console.log(`   Ekspektasi: ${test.expected}`);

    // Kirim refleksi
    const start = performance.now();
    const res = await axios.post(
      `${BASE_URL}/student/refleksi/submit`,
      {
        pertemuanId: PERTEMUAN_ID,
        content: test.content
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const responseTime = (performance.now() - start) / 1000;

    console.log(`   📤 Response awal: ${responseTime.toFixed(2)} detik`);
    console.log(`   📝 Submission ID: ${res.data.data.id}`);
    console.log('   ⏳ Menunggu AI selesai (5 detik)...');
    await new Promise(r => setTimeout(r, 5000));

    // Ambil hasil submission terbaru
    const subRes = await axios.get(
      `${BASE_URL}/student/submissions?pertemuanId=${PERTEMUAN_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const latest = subRes.data.data.find(s => s.id === res.data.data.id);
    
    if (latest) {
      console.log(`   🤖 AI Score: ${latest.aiScore || 'Belum terisi'}`);
      console.log(`   📝 Feedback: ${latest.feedback || 'Belum terisi'}`);
    } else {
      console.log('   ⚠️ Submission belum ditemukan di database.');
    }
    console.log('');
  }

  console.log('🎯 ===== TEST SELESAI =====');
  console.log('📊 Buka Prisma Studio untuk melihat detail:');
  console.log('   npx prisma studio');
  console.log('   Lalu buka tabel "submission" dan filter berdasarkan user.');
}

run().catch(console.error);
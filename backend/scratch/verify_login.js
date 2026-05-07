require('dotenv').config();
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function verify() {
  const email = 'dosen@lms.com';
  const passwordToTest = 'password123';
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User tidak ditemukan');
      return;
    }
    
    const isMatch = await bcrypt.compare(passwordToTest, user.password);
    console.log(`Verifikasi untuk ${email}:`);
    console.log(`Password yang diuji: "${passwordToTest}"`);
    console.log(`Hasil Cocok: ${isMatch ? 'YA' : 'TIDAK'}`);
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();

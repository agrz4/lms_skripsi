require('dotenv').config();
const prisma = require('./src/config/db');

async function main() {
  try {
    const result = await prisma.mataKuliah.findMany();
    console.log("Courses in database:", result);
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

require('dotenv').config();
const prisma = require('./src/config/db');

async function run() {
  // Update all courses to published: true so they show up on the dashboard
  await prisma.mataKuliah.updateMany({
    data: { published: true }
  });
  console.log("Successfully published all courses in the database!");

  const data = await prisma.mataKuliah.findMany();
  console.log(JSON.stringify(
    data.map(d => ({
      id: d.id,
      nama: d.nama,
      kode: d.kode,
      level: d.level,
      published: d.published
    })),
    null,
    2
  ));
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

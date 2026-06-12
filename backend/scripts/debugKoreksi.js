require('dotenv').config();
const prisma = require('../src/config/db');

async function main() {
  console.log('--- DIAGNOSTIC START ---');
  const submissions = await prisma.submission.findMany({
    include: {
      user: {
        select: { id: true, nama: true, email: true }
      },
      pertemuan: {
        include: {
          mataKuliah: {
            include: {
              pengajar: {
                select: { id: true, nama: true, email: true }
              }
            }
          },
          dosen: {
            select: { id: true, nama: true, email: true }
          }
        }
      }
    }
  });

  console.log(`Found ${submissions.length} submissions in database:`);
  submissions.forEach((s, idx) => {
    console.log(`\n[Submission ${idx + 1}]`);
    console.log(`- ID: ${s.id}`);
    console.log(`- Student: ${s.user?.nama} (${s.user?.email})`);
    console.log(`- Course: ${s.pertemuan?.mataKuliah?.nama}`);
    console.log(`- Meeting Urutan: P${s.pertemuan?.urutan}`);
    console.log(`- Meeting Lecturer (dosen): ${s.pertemuan?.dosen?.nama || 'NULL'}`);
    console.log(`- Course Lecturer (pengajar): ${s.pertemuan?.mataKuliah?.pengajar?.nama || 'NULL'}`);
    console.log(`- Course Lecturer ID: ${s.pertemuan?.mataKuliah?.pengajarId || 'NULL'}`);
  });
  console.log('--- DIAGNOSTIC END ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

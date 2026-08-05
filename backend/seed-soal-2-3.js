require('dotenv').config();
const prisma = require('./src/config/db');

const questionsData2 = [
  {
    pertanyaan: "Apa singkatan dari CSS?",
    options: {
      A: "Creative Style Sheets",
      B: "Cascading Style Sheets",
      C: "Computer Style Sheets",
      D: "Colorful Style Sheets"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Di bagian HTML mana stylesheet eksternal dirujuk?",
    options: {
      A: "Di akhir dokumen",
      B: "Di dalam elemen <body>",
      C: "Di dalam elemen <head>",
      D: "Di dalam elemen <header>"
    },
    correctAnswer: "C"
  },
  {
    pertanyaan: "Tag HTML manakah yang digunakan untuk menulis CSS internal?",
    options: {
      A: "<css>",
      B: "<style>",
      C: "<script>",
      D: "<styling>"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Atribut HTML mana yang digunakan untuk mendefinisikan style inline?",
    options: {
      A: "styles",
      B: "class",
      C: "font",
      D: "style"
    },
    correctAnswer: "D"
  },
  {
    pertanyaan: "Properti CSS mana yang digunakan untuk mengubah warna latar belakang?",
    options: {
      A: "color",
      B: "background-color",
      C: "bgcolor",
      D: "background"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Bagaimana cara mengubah warna teks elemen menggunakan CSS?",
    options: {
      A: "text-color",
      B: "color",
      C: "fgcolor",
      D: "font-color"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Properti CSS mana yang digunakan untuk mengatur ketebalan font?",
    options: {
      A: "font-weight",
      B: "font-style",
      C: "font-size",
      D: "bold"
    },
    correctAnswer: "A"
  },
  {
    pertanyaan: "Bagaimana cara membuat teks menjadi tebal (bold)?",
    options: {
      A: "font-weight: bold;",
      B: "font: bold;",
      C: "style: bold;",
      D: "text-decoration: bold;"
    },
    correctAnswer: "A"
  },
  {
    pertanyaan: "Properti CSS mana yang mengontrol ukuran teks?",
    options: {
      A: "text-style",
      B: "font-style",
      C: "font-size",
      D: "text-size"
    },
    correctAnswer: "C"
  },
  {
    pertanyaan: "Properti mana yang digunakan untuk memberikan jarak di dalam border elemen (padding)?",
    options: {
      A: "margin",
      B: "padding",
      C: "border-spacing",
      D: "spacer"
    },
    correctAnswer: "B"
  }
];

const questionsData3 = [
  {
    pertanyaan: "Di dalam elemen HTML mana kita menulis kode JavaScript?",
    options: {
      A: "<js>",
      B: "<javascript>",
      C: "<script>",
      D: "<code_js>"
    },
    correctAnswer: "C"
  },
  {
    pertanyaan: "Bagaimana cara menulis pesan 'Hello World' di kotak alert?",
    options: {
      A: "alertBox('Hello World');",
      B: "msg('Hello World');",
      C: "alert('Hello World');",
      D: "msgBox('Hello World');"
    },
    correctAnswer: "C"
  },
  {
    pertanyaan: "Bagaimana cara membuat fungsi di JavaScript?",
    options: {
      A: "function myFunction()",
      B: "function:myFunction()",
      C: "def myFunction()",
      D: "create myFunction()"
    },
    correctAnswer: "A"
  },
  {
    pertanyaan: "Bagaimana cara memanggil fungsi bernama 'myFunction'?",
    options: {
      A: "call myFunction()",
      B: "myFunction()",
      C: "execute myFunction()",
      D: "run myFunction()"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Bagaimana cara menulis conditional statement IF di JavaScript?",
    options: {
      A: "if i = 5 then",
      B: "if (i == 5)",
      C: "if i == 5 then",
      D: "if i = 5"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Bagaimana cara menulis perulangan FOR di JavaScript?",
    options: {
      A: "for (i = 0; i <= 5; i++)",
      B: "for (i <= 5; i++)",
      C: "for i = 1 to 5",
      D: "for (i = 0; i <= 5)"
    },
    correctAnswer: "A"
  },
  {
    pertanyaan: "Karakter mana yang digunakan untuk menulis komentar satu baris di JavaScript?",
    options: {
      A: "//",
      B: "/*",
      C: "#",
      D: "<!--"
    },
    correctAnswer: "A"
  },
  {
    pertanyaan: "Apa cara yang benar untuk mendefinisikan array di JavaScript?",
    options: {
      A: "var colors = (1:'red', 2:'green')",
      B: "var colors = ['red', 'green']",
      C: "var colors = 'red', 'green'",
      D: "var colors = 1 = ('red'), 2 = ('green')"
    },
    correctAnswer: "B"
  },
  {
    pertanyaan: "Operator penugasan mana yang digunakan untuk membandingkan nilai dan tipe data sekaligus?",
    options: {
      A: "=",
      B: "==",
      C: "===",
      D: "!="
    },
    correctAnswer: "C"
  },
  {
    pertanyaan: "Bagaimana cara membulatkan angka 7.25 ke integer terdekat?",
    options: {
      A: "Math.round(7.25)",
      B: "rnd(7.25)",
      C: "Math.rnd(7.25)",
      D: "round(7.25)"
    },
    correctAnswer: "A"
  }
];

async function seed() {
  try {
    const course = await prisma.mataKuliah.findFirst({
      where: { kode: 'MK001' } // Dasar Pemrograman Web
    });

    if (!course) {
      console.error("Course Dasar Pemrograman Web (MK001) not found!");
      return;
    }

    console.log(`Found Course: ${course.nama} with ID: ${course.id}`);

    const dosen = await prisma.user.findFirst({
      where: { role: 'DOSEN' }
    });

    if (!dosen) {
      console.error("Dosen user not found in database!");
      return;
    }

    // Ensure Pertemuan 2 & 3 exist
    const pList = [];
    for (let u of [2, 3]) {
      let p = await prisma.pertemuan.findFirst({
        where: { mataKuliahId: course.id, urutan: u }
      });
      const topikName = u === 2 ? 'CSS Dasar' : 'JavaScript Dasar';
      if (!p) {
        p = await prisma.pertemuan.create({
          data: {
            mataKuliahId: course.id,
            urutan: u,
            topik: topikName
          }
        });
        console.log(`Created Pertemuan ${u}: ${topikName}`);
      } else {
        console.log(`Pertemuan ${u} already exists`);
      }
      pList.push(p);
    }

    // 1. Seed Pertemuan 2 (CSS) if questions not already seeded
    const existingP2Questions = await prisma.soal.count({
      where: { mataKuliahId: course.id, pertemuanId: pList[0].id }
    });
    if (existingP2Questions === 0) {
      for (const q of questionsData2) {
        await prisma.soal.create({
          data: {
            pertanyaan: JSON.stringify(q),
            tipesoal: 'PILIHAN_GANDA',
            status: 'APPROVED',
            mataKuliahId: course.id,
            pertemuanId: pList[0].id,
            dibuatOleh: dosen.id
          }
        });
      }
      console.log("Seeded 10 questions for Pertemuan 2.");
    } else {
      console.log(`Pertemuan 2 already has ${existingP2Questions} questions. Seeding skipped to avoid duplicates.`);
    }

    // 2. Seed Pertemuan 3 (JS) if questions not already seeded
    const existingP3Questions = await prisma.soal.count({
      where: { mataKuliahId: course.id, pertemuanId: pList[1].id }
    });
    if (existingP3Questions === 0) {
      for (const q of questionsData3) {
        await prisma.soal.create({
          data: {
            pertanyaan: JSON.stringify(q),
            tipesoal: 'PILIHAN_GANDA',
            status: 'APPROVED',
            mataKuliahId: course.id,
            pertemuanId: pList[1].id,
            dibuatOleh: dosen.id
          }
        });
      }
      console.log("Seeded 10 questions for Pertemuan 3.");
    } else {
      console.log(`Pertemuan 3 already has ${existingP3Questions} questions. Seeding skipped to avoid duplicates.`);
    }

    console.log("Seeding for Meetings 2 and 3 complete.");
  } catch (err) {
    console.error("Error during seeding:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

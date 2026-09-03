const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const { extractMateri } = require("./src/services/extractorService");
const { callOllama } = require("./src/services/ollamaService");

// ============================================
// TEST QUESTIONS
// ============================================

const questions = [

{
    id: 1,

    question:
    "Apa yang dimaksud dengan algoritma?",

    expectedByHuman:
    "Algoritma adalah urutan langkah-langkah logis untuk menyelesaikan suatu masalah yang disusun secara sistematis dan logis.",

    reason:
    "Definisi algoritma dijelaskan secara langsung pada materi.",

    sourcePage: [2,4],

    difficulty: "easy",

    type: "definition",

    score: 10,

    outOfContext: false
},

{
    id: 2,

    question:
    "Mengapa algoritma sangat penting sebelum membuat program?",

    expectedByHuman:
    "Karena algoritma membantu memahami alur program, mempermudah pengembangan, dan menghasilkan output yang benar.",

    reason:
    "Materi menjelaskan pentingnya algoritma sebelum proses pemrograman.",

    sourcePage: [2],

    difficulty: "easy",

    type: "concept",

    score: 10,

    outOfContext: false
},

{
    id: 3,

    question:
    "Sebutkan minimal lima fungsi algoritma.",

    expectedByHuman:
    "Memecahkan program yang rumit, menyederhanakan program besar, dapat digunakan berulang, memudahkan pembuatan program, mengatasi masalah secara logis, meminimalkan penulisan berulang, mempermudah pengembangan, mempermudah pencarian error, mempermudah modifikasi, dan mempermudah dokumentasi.",

    reason:
    "Daftar fungsi algoritma terdapat pada materi.",

    sourcePage: [2],

    difficulty: "medium",

    type: "list",

    score: 15,

    outOfContext: false
},

{
    id: 4,

    question:
    "Jelaskan tahapan umum pembuatan sebuah program.",

    expectedByHuman:
    "Dimulai dari mendefinisikan masalah, menentukan algoritma, menulis program, menguji program, hingga dokumentasi.",

    reason:
    "Tahapan pembuatan program dijelaskan pada bagian proses pembuatan software.",

    sourcePage: [3],

    difficulty: "medium",

    type: "process",

    score: 15,

    outOfContext: false
},

{
    id: 5,

    question:
    "Apa saja bagian utama struktur suatu program?",

    expectedByHuman:
    "Input, Output, Proses Pengolahan Data, dan Penyimpanan Data.",

    reason:
    "Materi menjelaskan empat bagian utama struktur program.",

    sourcePage: [3,4],

    difficulty: "easy",

    type: "list",

    score: 10,

    outOfContext: false
},

{
    id: 6,

    question:
    "Apa pengertian Flowchart Sistem?",

    expectedByHuman:
    "Flowchart Sistem adalah bagan yang menunjukkan alur kerja atau prosedur dalam suatu sistem secara keseluruhan.",

    reason:
    "Definisi Flowchart Sistem diberikan pada awal subbab 3.1.",

    sourcePage: [6,7],

    difficulty: "medium",

    type: "definition",

    score: 10,

    outOfContext: false
},

{
    id: 7,

    question:
    "Sebutkan lima jenis flowchart.",

    expectedByHuman:
    "Flowchart Sistem, Flowchart Paperwork/Dokumen, Flowchart Skematik, Flowchart Program, dan Flowchart Proses.",

    reason:
    "Kelima jenis flowchart dijelaskan pada materi.",

    sourcePage: [6],

    difficulty: "easy",

    type: "list",

    score: 10,

    outOfContext: false
},

{
    id: 8,

    question:
    "Apa fungsi Flowchart Program?",

    expectedByHuman:
    "Flowchart Program menjelaskan langkah-langkah program secara rinci sesuai urutan pelaksanaannya.",

    reason:
    "Definisi Flowchart Program dijelaskan pada subbab 3.4.",

    sourcePage: [10],

    difficulty: "medium",

    type: "concept",

    score: 10,

    outOfContext: false
},

{
    id: 9,

    question:
    "Apa fungsi Flowchart Proses?",

    expectedByHuman:
    "Flowchart Proses digunakan untuk memecah dan menganalisis langkah-langkah suatu prosedur atau sistem, terutama pada proses industri dan analisis sistem.",

    reason:
    "Penjelasan terdapat pada subbab 3.5.",

    sourcePage: [12],

    difficulty: "medium",

    type: "concept",

    score: 10,

    outOfContext: false
},

{
    id: 10,

    question:
    "Sebutkan minimal tiga pedoman dalam membuat flowchart.",

    expectedByHuman:
    "Flowchart digambar dari atas ke bawah dan kiri ke kanan, setiap aktivitas harus didefinisikan dengan jelas, setiap langkah harus berada pada urutan yang benar, menggunakan simbol standar, dan menentukan awal serta akhir aktivitas dengan jelas.",

    reason:
    "Pedoman flowchart terdapat pada bagian 2.",

    sourcePage: [5],

    difficulty: "medium",

    type: "list",

    score: 15,

    outOfContext: false
},

{
    id: 11,

    question:
    "Apa perbedaan TCP dan UDP?",

    expectedByHuman:
    "Informasi tersebut tidak terdapat pada materi.",

    reason:
    "Materi hanya membahas algoritma dan flowchart.",

    sourcePage: [],

    difficulty: "hard",

    type: "out_of_context",

    score: 0,

    outOfContext: true
}

];

// ============================================
// PRINT
// ============================================

function line() {

    console.log(
        "========================================================"
    );

}

function title(text) {

    line();

    console.log(text);

    line();

}

// ============================================
// BUILD KNOWLEDGE
// ============================================

async function buildKnowledge() {

    title("BUILD KNOWLEDGE");

    const materi = {

        fileUrl: "/public/testpdf/materi1.pdf",

        transcript: "",

        summary: ""

    };

    const result = await extractMateri(materi);

    console.log();

    console.log("PDF TEXT");

    console.log(result.pdfText.length);

    console.log();

    console.log("VISION");

    console.log(result.visionKnowledge.length);

    console.log();

    console.log("KNOWLEDGE");

    console.log(result.knowledge.length);

    return result.knowledge;

}

// ============================================
// BUILD PROMPT
// ============================================

function buildPrompt(knowledge, question) {

    return `
Anda adalah seorang DOSEN UNIVERSITAS yang sedang membuat KUNCI JAWABAN RESMI.

==========================
ATURAN YANG WAJIB DIIKUTI
==========================

ATURAN WAJIB

Jika jawaban tidak dapat ditemukan SECARA EKSPLISIT pada materi,
MAKA JANGAN menjawab menggunakan pengetahuan model.

Keluarkan JSON berikut:

{
"found":false,
"expectedAnswer":"Informasi tersebut tidak terdapat pada materi yang diberikan.",
"citation":[],
"keyPoints":[],
"rubric":[]
}

Jawaban yang menggunakan pengetahuan umum dianggap SALAH.

Jangan melengkapi informasi.

Jangan menyimpulkan.

Jangan mengira-ngira.

Hanya boleh menggunakan kalimat yang dapat didukung oleh materi.

==========================
MATERI
==========================

${knowledge}

==========================
PERTANYAAN
==========================

${question}

==========================
TUGAS
==========================

Langkah pertama:

Periksa apakah jawaban dapat ditemukan pada materi.

Jika TIDAK ditemukan,

langsung keluarkan JSON berikut:

{
    "found": false,
    "expectedAnswer": "Informasi tersebut tidak terdapat pada materi yang diberikan.",
    "citation": [],
    "keyPoints": [],
    "rubric": []
}

Jika ditemukan,

buat JSON berikut:

{

    "found": true,

    "expectedAnswer":"",

    "keyPoints":[

        ""

    ],

    "rubric":[

        {

            "point":"",

            "score":0

        }

    ]

}

Jawaban HARUS berupa JSON.

Jangan menggunakan markdown.

Jangan menggunakan \`\`\`.

Output HARUS JSON murni.
`;

}

// ============================================
// BUILD EXPECTED ANSWER
// ============================================

async function buildExpectedAnswer(

    knowledge,

    question

) {

    title("BUILD EXPECTED ANSWER");

    console.log("Question:");

    console.log(question);

    console.log();

    const prompt = buildPrompt(

        knowledge,

        question

    );

    console.log("Mengirim Prompt ke Qwen...");


    const result = await callOllama(prompt);

console.log("========== HASIL AI ==========");
console.dir(result, { depth: null });
console.log("==============================");

return result;

}

// ============================================
// PRINT RESULT
// ============================================

function printResult(

    soal,

    result

){
    console.log("GROUND TRUTH");

console.log(

    soal.expectedByHuman

);

console.log();

console.log("REASON");

console.log(

    soal.reason

);

console.log();

console.log("SOURCE PAGE");

console.log(

    soal.sourcePage

);

console.log();

console.log("DIFFICULTY");

console.log(

    soal.difficulty

);

console.log();

console.log("TYPE");

console.log(

    soal.type

);

console.log();

    line();

    console.log("QUESTION");

    line();

    console.log(soal.question);

    console.log();

    line();

    console.log("EXPECTED ANSWER");

    line();

    console.log(

        result.expectedAnswer ||

        "(kosong)"

    );

    console.log();

    line();

    console.log("KEY POINTS");

    line();

    if(

        Array.isArray(

            result.keyPoints

        )

    ){

        result.keyPoints.forEach(

            (item,index)=>{

                console.log(

                    `${index+1}. ${item}`

                );

            }

        );

    }

    console.log();

    line();

    console.log("RUBRIC");

    line();

    if(

        Array.isArray(

            result.rubric

        )

    ){

        result.rubric.forEach(

            (item,index)=>{

                console.log(

                    `${index+1}. ${item.point} (${item.score})`

                );

            }

        );

    }

    console.log();

}

// ============================================
// SAVE RESULT
// ============================================

function saveResult(results) {

    const outputPath = path.join(

        __dirname,

        "test-result.json"

    );

    fs.writeFileSync(

        outputPath,

        JSON.stringify(

            results,

            null,

            4

        ),

        "utf8"

    );

    console.log();

    console.log("Hasil disimpan ke:");

    console.log(outputPath);

}

// ============================================
// MAIN
// ============================================

async function main(){

    try{

        title(

            "AI PIPELINE TEST"

        );

        const knowledge =

            await buildKnowledge();

        console.log();

        console.log(

            "Knowledge Size :",

            knowledge.length

        );

        console.log();

const allResults = [];

for (const soal of questions) {

    const result = await buildExpectedAnswer(

        knowledge,

        soal.question

    );

    if(result.found===false){

    console.log();

    console.log("================================");

    console.log("OUT OF CONTEXT");

    console.log("================================");

    }

    printResult(

    soal,

    result

);

    allResults.push({

        id: soal.id,

        question: soal.question,

        expectedByHuman: soal.expectedByHuman,

        reason: soal.reason,

        sourcePage: soal.sourcePage,

        difficulty: soal.difficulty,

        type: soal.type,

        score: soal.score,

        outOfContext: soal.outOfContext,

        aiAnswer: result.expectedAnswer,

        keyPoints: result.keyPoints,

        rubric: result.rubric

    });

}

saveResult(allResults);

        title(

            "PIPELINE FINISHED"

        );

    }

    catch(err){

        console.error(err);

    }

}

main();
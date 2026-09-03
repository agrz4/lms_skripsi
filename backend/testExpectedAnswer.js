const path = require("path");

const { analyzePDF } = require("./src/services/pdfAnalyzer");
const { renderPdfPages } = require("./src/services/extractorService");
const { describeImage } = require("./src/services/visionService");
const { callOllama } = require("./src/services/ollamaService");
const pdfParse = require("pdf-parse");
const fs = require("fs");

async function main() {

    // ==========================
    // PDF
    // ==========================

    const pdfPath = path.join(
        __dirname,
        "public",
        "testpdf",
        "materi1.pdf"
    );

    console.log("PDF:");
    console.log(pdfPath);

    // ==========================
    // Extract Text
    // ==========================

    const buffer = fs.readFileSync(pdfPath);

    const pdf = await pdfParse(buffer);

    const pdfText = pdf.text;

    console.log("\n===== PDF TEXT =====");
    console.log(
        pdfText.substring(0,500)
    );

    // ==========================
    // Analyze PDF
    // ==========================

    const analysis = await analyzePDF(
        pdfPath
    );

    console.log("\n===== ANALYSIS =====");

    console.dir(
        analysis,
        {
            depth:null
        }
    );

    // ==========================
    // Select Vision Pages
    // ==========================

    const pagesToRender =
        analysis
        .filter(
            page=>page.needVision
        )
        .map(
            page=>page.page
        );

    console.log("\nVision Pages:");

    console.log(
        pagesToRender
    );

    // ==========================
    // Render
    // ==========================

    const images =
        await renderPdfPages(

            pdfPath,

            pagesToRender

        );

    let visionKnowledge = "";

    for(const img of images){

        console.log("\nVision:");

        console.log(img);

        const hasil =
            await describeImage(img);

        visionKnowledge +=

            "\n\n"+hasil;

    }

    // ==========================
    // Final Knowledge
    // ==========================

    const knowledge=[

        pdfText,

        visionKnowledge

    ]

    .filter(Boolean)

    .join("\n\n");

    console.log("\n===== KNOWLEDGE =====");

    console.log(

        knowledge.substring(

            0,

            3000

        )

    );

    // ==========================
    // SOAL
    // ==========================

    const soal=`

Jelaskan isi materi diatas.

`;

    // ==========================
    // Prompt
    // ==========================

    const prompt=`

Anda adalah dosen.

Gunakan HANYA materi berikut.

========================

${knowledge}

========================

PERTANYAAN

${soal}

========================

Jawablah pertanyaan.

Kemudian buat key points.

Output JSON.

{

"expectedAnswer":"",

"keyPoints":[

]

}

`;

    // ==========================
    // Qwen
    // ==========================

    const hasilAI=

        await callOllama(

            prompt

        );

    console.log(

        "\n===== RAW AI ====="

    );

    console.log(

        hasilAI

    );

}

main();
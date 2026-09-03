const prisma = require("../config/db");
const { splitText } = require("./chunkService");
const { generateEmbedding } = require("./embeddingService");
const { extractMateri } = require("./extractorService");

const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

/**
 * Mengubah satu materi menjadi banyak embedding chunk
 * lalu menyimpannya ke tabel MateriVector
 *
 * @param {Object} materi
 * @returns {Number}
 */
async function indexMateri(materi) {

    try {

        const {

        knowledge

} = await extractMateri(materi);

        const isiMateri = [

    knowledge,

    materi.refleksi || ""

]

.filter(item => item && item.trim() !== "")

.join("\n\n");

        if (!isiMateri.trim()) {
            console.log("Materi kosong, dilewati.");
            return 0;
        }

        console.log("======================================");
        console.log("Indexing Materi :", materi.nama);
        console.log("======================================");

        await prisma.materi.update({
            where: {
                id: materi.id
            },
            data: {
                embeddingStatus: "PROCESSING"
            }
        });

        const chunks = splitText(
            isiMateri,
            1000,
            200
        );

        console.log("Jumlah Chunk :", chunks.length);

        await prisma.materiVector.deleteMany({
            where: {
                materiId: materi.id
            }
        });

        for (let i = 0; i < chunks.length; i++) {

            console.log(`Embedding Chunk ${i + 1}/${chunks.length}`);

            const embedding =
                await generateEmbedding(chunks[i]);

            await prisma.materiVector.create({

                data: {

                    materiId: materi.id,

                    chunkIndex: i,

                    content: chunks[i],

                    embedding: JSON.stringify(embedding),

                    metadata: {

                        source: "materi",

                        materi: materi.nama,

                        chunk: i,

                        createdAt: new Date()

                    }

                }

            });

        }

        await prisma.materi.update({

            where: {

                id: materi.id

            },

            data: {

                embeddingStatus: "SUCCESS"

            }

        });

        console.log("======================================");
        console.log("Indexing selesai.");
        console.log("======================================");

        return chunks.length;

    } catch (err) {

        console.error(err);

        await prisma.materi.update({

            where: {

                id: materi.id

            },

            data: {

                embeddingStatus: "FAILED"

            }

        });

        throw err;
    }
}

async function extractTextFromPDF(fileUrl) {
    try {

        if (!fileUrl) return "";

        const publicDir = path.join(__dirname, "../../public");

        const filePath = path.join(
            publicDir,
            fileUrl.replace(/^\/public\//, "")
        );

        if (!fs.existsSync(filePath)) {
            return "";
        }

        const buffer = fs.readFileSync(filePath);

        const pdf = await pdfParse(buffer);

        return pdf.text || "";

    } catch (err) {

        console.error("Gagal membaca PDF:", err);

        return "";

    }
}



/**
 * Menghitung cosine similarity dua embedding
 *
 * @param {Array<number>} vecA
 * @param {Array<number>} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {

        dotProduct += vecA[i] * vecB[i];

        magnitudeA += vecA[i] * vecA[i];

        magnitudeB += vecB[i] * vecB[i];

    }

    magnitudeA = Math.sqrt(magnitudeA);

    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {

        return 0;

    }

    return dotProduct / (magnitudeA * magnitudeB);

}
/**
 * Mengambil embedding jawaban mahasiswa
 *
 * @param {String} jawaban
 * @returns {Array<number>}
 */
async function getEmbeddingVector(jawaban) {

    const embedding = await generateEmbedding(jawaban);

    return embedding;

}
/**
 * Mengambil chunk materi yang paling relevan
 *
 * @param {String} pertemuanId
 * @param {String} jawaban
 * @param {Number} topK
 * @returns {Array}
 */
async function cariMateriRelevan(
    pertemuanId,
    jawaban,
    topK = 5
) {

    const questionEmbedding =
        await getEmbeddingVector(jawaban);

    const vectors =
        await prisma.materiVector.findMany({

            where: {

                materi: {

                    pertemuanId

                }

            },

            include: {

                materi: {

                    include: {

                        pertemuan: true

                    }

                }

            }

        });

    const hasil = [];

    for (const vector of vectors) {

        const embedding =
            JSON.parse(vector.embedding);

        const similarity =
            cosineSimilarity(
                questionEmbedding,
                embedding
            );
    hasil.push({

        similarity,

        content: vector.content,

        materiId: vector.materiId,

        materiNama: vector.materi.nama,

        pertemuan: vector.materi.pertemuan.urutan,

        metadata: vector.metadata

});


    }

    hasil.sort((a, b) => {

        return b.similarity - a.similarity;

    });

    return hasil.slice(0, topK);

}

module.exports = {

    indexMateri,

    cariMateriRelevan,

    cosineSimilarity

};
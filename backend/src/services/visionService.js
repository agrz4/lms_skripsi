const fs = require("fs");
const axios = require("axios");

const {
    VISION_MODEL
} = require("../config/aiConfig");

const OLLAMA_URL = "http://localhost:11434/api/chat";

/**
 * Mengubah gambar menjadi Base64
 */
function encodeImage(imagePath) {
    return fs.readFileSync(imagePath).toString("base64");
}

/**
 * Mengirim gambar ke Qwen2.5-VL
 */
async function describeImage(imagePath) {

    console.log("================================");
    console.log("VISION SERVICE");
    console.log("================================");

    console.log("Image Path :", imagePath);

    const image = encodeImage(imagePath);

    console.log("Base64 Size :", image.length);

const prompt = `
Anda adalah AI yang bertugas membangun KNOWLEDGE dari materi pembelajaran.

Tugas Anda BUKAN mendeskripsikan gambar.

Tugas Anda adalah mengekstrak seluruh informasi yang terdapat pada gambar agar dapat digunakan AI lain untuk menjawab soal mahasiswa.

Ikuti aturan berikut:

1. Jika terdapat flowchart:
- Jelaskan tujuan flowchart.
- Jelaskan setiap proses.
- Jelaskan setiap decision.
- Jelaskan hubungan antar langkah.
- Jelaskan alur proses secara lengkap.

2. Jika terdapat UML:
- Jelaskan fungsi setiap class.
- Jelaskan atribut penting.
- Jelaskan method penting.
- Jelaskan hubungan antar class.
- Jelaskan inheritance, association, aggregation atau composition jika ada.

3. Jika terdapat ERD:
- Jelaskan setiap entitas.
- Jelaskan atribut utama.
- Jelaskan primary key dan foreign key jika terlihat.
- Jelaskan hubungan antar entitas.

4. Jika terdapat diagram sistem, arsitektur, blok diagram atau topologi:
- Jelaskan fungsi setiap komponen.
- Jelaskan hubungan antar komponen.
- Jelaskan alur kerja sistem.

5. Jika terdapat tabel:
- Jelaskan isi tabel.
- Jelaskan arti setiap kolom.
- Jelaskan hubungan antar data.

6. Jika terdapat grafik:
- Jelaskan tren.
- Jelaskan makna grafik.
- Jelaskan informasi penting yang dapat dipelajari.

7. Jika terdapat screenshot source code:
- Jelaskan bahasa pemrograman yang digunakan jika dapat dikenali.
- Jelaskan fungsi program.
- Jelaskan logika program.
- Jelaskan algoritma yang digunakan.
- Jelaskan fungsi setiap bagian penting.

8. Jika terdapat pseudocode:
- Jelaskan langkah algoritma.
- Jelaskan tujuan algoritma.
- Jelaskan proses yang dilakukan.

9. Jika terdapat rumus:
- Jelaskan arti rumus.
- Jelaskan fungsi setiap variabel.
- Jelaskan kapan rumus digunakan.

Jawaban HARUS berupa KNOWLEDGE.

Jangan menulis:

"Gambar ini menunjukkan..."

atau

"Terlihat gambar..."

atau

"Pada gambar terdapat..."

Langsung tuliskan isi pengetahuan yang dapat digunakan AI untuk menjawab soal mahasiswa.

Gunakan Bahasa Indonesia yang formal.
`;

    const response = await axios.post(
        OLLAMA_URL,
        {
            model: VISION_MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt,
                    images: [image]
                }
            ],
            stream: false,
            keep_alive: "5m" // otomatis unload dari RAM 5 menit setelah tidak dipakai
        }
    );

    console.log("========== RESPONSE OLLAMA ==========");
    console.dir(response.data, { depth: null });
    console.log("=====================================");

    return response.data.message.content;
}

module.exports = {
    describeImage
};
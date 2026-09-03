const axios = require('axios');

// Alamat Ollama dibaca dari .env.
// Sebelumnya alamat ini ditulis langsung di kode, sehingga variabel
// OLLAMA_URL yang sudah ada di .env tidak pernah berpengaruh.
const OLLAMA_BASE_URL = (process.env.OLLAMA_URL || 'http://localhost:11434')
    .replace(/\/+$/, '');

const OLLAMA_GEN_URL = `${OLLAMA_BASE_URL}/api/generate`;
const OLLAMA_EMBED_URL = `${OLLAMA_BASE_URL}/api/embeddings`;

// Batas waktu satu panggilan. Tanpa ini, permintaan yang menggantung
// (misalnya saat Ollama memuat model pertama kali dan kehabisan RAM)
// akan menunggu tanpa batas dan proses latar belakang tidak pernah selesai.
const OLLAMA_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT || 300000);
const OLLAMA_EMBED_TIMEOUT = Number(process.env.OLLAMA_EMBED_TIMEOUT || 60000);
const {
    CHAT_MODEL,
    TEMPERATURE
} = require("../config/aiConfig");

/**
 * Mengurai keluaran model menjadi objek JSON.
 *
 */
function uraikanJson(teks) {

    if (typeof teks !== "string") {
        throw new Error("Output AI bukan teks.");
    }

    let bersih = teks
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    // Blok penalaran yang tidak tertutup, misalnya karena keluaran
    // terpotong, tetap dibuang sampai penutupnya.
    const penutup = bersih.lastIndexOf("</think>");

    if (penutup !== -1) {
        bersih = bersih.slice(penutup + "</think>".length).trim();
    }

    try {
        return JSON.parse(bersih);
    } catch {
        // lanjut ke pencarian manual
    }

    const awal = bersih.indexOf("{");
    const akhir = bersih.lastIndexOf("}");

    if (awal !== -1 && akhir > awal) {

        const potongan = bersih.slice(awal, akhir + 1);

        try {
            return JSON.parse(potongan);
        } catch {
            // lanjut ke galat di bawah
        }
    }

    console.error("Keluaran model yang gagal diurai:\n", teks.slice(0, 500));

    throw new Error("Output AI bukan JSON yang valid.");
}

/**
 * Panggil Ollama untuk generate teks
 * @param {string} prompt - Prompt lengkap
 * @param {string} model - Nama model (default: qwen2.5vl:3b)
 * @returns {Promise<object>} - Hasil JSON yang diparse
 */
async function callOllama(
    prompt,
    model = CHAT_MODEL,
    images = []
) {
  try {

        /**
         * Menyusun badan permintaan.
         *
         * pakaiFormatJson dibuat dapat dimatikan karena pembatasan tata
         * bahasa JSON dapat berbenturan dengan model bermode penalaran
         * seperti keluarga qwen3-vl. Pada benturan tersebut model
         * mengembalikan keluaran KOSONG, bukan JSON yang salah, sehingga
         * gejalanya sulit dikenali.
         */
        const susunBody = (pakaiFormatJson, batasToken) => {

            const body = {
                model,
                prompt,
                stream: false,
                think: false,
                options: {
                    temperature: 0,
                    top_p: 0.1,
                    top_k: 10,
                    repeat_penalty: 1.0,
                    num_predict: batasToken
                }
            };

            if (pakaiFormatJson) {
                body.format = "json";
            }

            if (images.length > 0) {
                body.images = images;
            }

            return body;
        };

        const kirim = async (body) => {

            const response = await axios.post(
                OLLAMA_GEN_URL,
                body,
                { timeout: OLLAMA_TIMEOUT }
            );

            return response.data;
        };

        // ---- Percobaan pertama: dengan pembatasan format JSON ----

        let data = await kirim(susunBody(true, 1200));

        let result = data.response;

        if (typeof result === "object" && result !== null) {
            return result;
        }

        // ---- Percobaan kedua: tanpa pembatasan format ----
        //
        // Dijalankan bila keluaran kosong atau tidak dapat diurai.
        // Pengurai di bawah sudah tahan terhadap blok penalaran dan
        // teks tambahan, sehingga pembatasan format tidak wajib.

        const kosong = typeof result !== "string" || result.trim() === "";

        if (!kosong) {
            try {
                return uraikanJson(result);
            } catch {
                console.warn("Ollama: keluaran tidak dapat diurai, mencoba tanpa format JSON...");
            }
        } else {
            console.warn("Ollama: keluaran kosong, mencoba tanpa format JSON...");
            console.warn("  done_reason:", data.done_reason);
        }

        data = await kirim(susunBody(false, 2048));

        result = data.response;

        if (typeof result === "object" && result !== null) {
            return result;
        }

        if (typeof result !== "string" || result.trim() === "") {
            console.error("Ollama mengembalikan keluaran kosong pada kedua percobaan.");
            console.error("  done_reason:", data.done_reason);
            throw new Error("Output AI kosong.");
        }

        return uraikanJson(result);

    } catch (error) {

        console.error("Ollama generate error:", error.message);

        throw new Error(
            "Gagal memanggil Ollama: " + error.message
        );

    }

}

/**
 * Generate embedding menggunakan nomic-embed-text
 * @param {string} text - Teks yang akan di-embed
 * @returns {Promise<Array>} - Array vektor embedding
 */
async function generateEmbedding(text) {
  try {
    const response = await axios.post(OLLAMA_EMBED_URL, {
      model: 'nomic-embed-text:latest',
      prompt: text
    }, { timeout: OLLAMA_EMBED_TIMEOUT });
    return response.data.embedding;
  } catch (error) {
    console.error('Ollama embedding error:', error.message);
    throw new Error('Gagal membuat embedding: ' + error.message);
  }
}

module.exports = { callOllama, generateEmbedding };
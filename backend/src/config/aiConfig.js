/**
 * Konfigurasi model AI.
 *
 * Model penilaian sengaja dipisahkan dari model vision.
 */
module.exports = {

    // Model umum: ringkasan, pembangkitan kunci jawaban
    CHAT_MODEL:
        process.env.OLLAMA_MODEL || "qwen2.5vl:3b",

    // Model khusus pembacaan citra. Harus model bahasa-visual.
    VISION_MODEL:
        process.env.OLLAMA_VISION_MODEL
        || process.env.OLLAMA_MODEL
        || "qwen2.5vl:3b",

    // Model khusus penilaian jawaban.
    // Cukup model teks, tidak perlu kemampuan visual.
    GRADING_MODEL:
        process.env.OLLAMA_GRADING_MODEL
        || process.env.OLLAMA_MODEL
        || "qwen2.5vl:3b",

    EMBEDDING_MODEL:
        process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text",

    TEMPERATURE: 0

};

/**
 * Memecah teks menjadi beberapa bagian (chunk)
 * agar lebih mudah diproses oleh embedding dan RAG.
 */

function splitText(
    text,
    chunkSize = 1000,
    overlap = 200
) {

    if (!text || text.trim() === "") {
        return [];
    }

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        const end = Math.min(
            start + chunkSize,
            text.length
        );

        chunks.push(
            text.slice(start, end).trim()
        );

        start += chunkSize - overlap;
    }

    return chunks.filter(
        chunk => chunk.length > 0
    );
}

module.exports = {
    splitText
};
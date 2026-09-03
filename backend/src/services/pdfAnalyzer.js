const { openPdf } = require("./pdfRenderService");

/**
 * =====================================================================
 * PDF ANALYZER
 * =====================================================================
 *
 * Menentukan halaman mana yang perlu dibaca oleh model vision.
 *
 * Perbaikan dari versi sebelumnya:
 * - Mendeteksi diagram VEKTOR (hasil export PowerPoint / Visio / draw.io).
 *   Diagram seperti ini TIDAK mengandung paintImageXObject sama sekali,
 *   sehingga pada versi lama selalu lolos dari vision.
 * - Mendeteksi rasio teks per halaman (halaman scan / slide gambar).
 * - Memberi alasan (reason) agar mudah didebug dan dijelaskan di skripsi.
 * =====================================================================
 */

const KEYWORD_VISUAL = [
    "flowchart", "diagram", "gambar", "uml", "erd", "activity",
    "sequence", "class diagram", "state", "use case", "deployment",
    "component", "dfd", "struktur", "arsitektur", "topologi",
    "kode", "program", "source code", "algoritma", "pseudocode",
    "tabel", "grafik", "skema", "rangkaian", "blok"
];

/**
 * Menganalisis seluruh halaman PDF.
 *
 * @param {string} pdfPath
 * @returns {Promise<Array<object>>}
 */
async function analyzePDF(pdfPath) {

    const { pdf, loadingTask, pdfjs } = await openPdf(pdfPath);

    const OPS = pdfjs.OPS;

    const result = [];

    try {

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

            const page = await pdf.getPage(pageNumber);

            // ----------------------------------------------------------
            // Teks halaman
            // ----------------------------------------------------------

            const textContent = await page.getTextContent();

            const text = textContent.items
                .map(item => item.str)
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();

            // ----------------------------------------------------------
            // Operator grafis halaman
            // ----------------------------------------------------------

            const operatorList = await page.getOperatorList();

            const fnArray = operatorList.fnArray;

            let bitmapCount = 0;
            let pathCount = 0;
            let shadingCount = 0;

            for (const fn of fnArray) {

                if (
                    fn === OPS.paintImageXObject ||
                    fn === OPS.paintInlineImageXObject ||
                    fn === OPS.paintImageMaskXObject ||
                    fn === OPS.paintJpegXObject
                ) {
                    bitmapCount++;
                }
                else if (fn === OPS.constructPath) {
                    pathCount++;
                }
                else if (
                    fn === OPS.shadingFill ||
                    fn === OPS.paintFormXObjectBegin
                ) {
                    shadingCount++;
                }
            }

            const hasImage = bitmapCount > 0;

            // Banyak path = kemungkinan besar diagram vektor
            const hasVectorGraphic = pathCount >= 12;

            const lowerText = text.toLowerCase();

            const hasKeyword = KEYWORD_VISUAL.some(
                keyword => lowerText.includes(keyword)
            );

            // ----------------------------------------------------------
            // Skoring
            // ----------------------------------------------------------

            let score = 0;
            const reason = [];

            if (hasImage) {
                score += 60;
                reason.push(`gambar bitmap (${bitmapCount})`);
            }

            if (hasVectorGraphic) {
                score += 45;
                reason.push(`grafik vektor (${pathCount} path)`);
            }

            if (shadingCount > 0) {
                score += 10;
                reason.push("shading/form object");
            }

            if (hasKeyword) {
                score += 25;
                reason.push("kata kunci visual");
            }

            // Halaman hampir tanpa teks tapi ada objek grafis
            // => slide gambar atau hasil scan
            if (text.length < 150 && (hasImage || hasVectorGraphic)) {
                score += 25;
                reason.push("teks sangat sedikit");
            }

            // Halaman benar-benar kosong tidak perlu vision
            if (text.length === 0 && !hasImage && !hasVectorGraphic) {
                score = 0;
                reason.length = 0;
                reason.push("halaman kosong");
            }

            const needVision = score >= 50;

            result.push({
                page: pageNumber,
                text,
                textLength: text.length,
                bitmapCount,
                pathCount,
                hasImage,
                hasVectorGraphic,
                hasKeyword,
                score,
                needVision,
                reason: reason.join(", ") || "tidak ada indikasi visual"
            });

            page.cleanup();
        }

    } finally {

        try {
            await loadingTask.destroy();
        } catch {
            // abaikan
        }
    }

    return result;
}

module.exports = {
    analyzePDF
};

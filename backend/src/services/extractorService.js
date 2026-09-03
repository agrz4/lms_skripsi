const fs = require("fs");

const { resolveLocalPath, getExtension } = require("../utils/mediaPath");
const { analyzePDF } = require("./pdfAnalyzer");
const { renderPdfPages, cleanupRendered } = require("./pdfRenderService");
const { describeImage } = require("./visionService");
const {
    extractKeyframes,
    cleanupFrames,
    formatTimestamp
} = require("./videoFrameService");

/**
 * =====================================================================
 * EXTRACTOR SERVICE
 * =====================================================================
 *
 * Mengubah satu materi (PDF / gambar / video) menjadi satu blok
 * knowledge berbentuk teks, siap dipecah menjadi chunk dan di-embedding.
 *
 * Sumber pengetahuan yang digabung:
 *   1. summary        - ringkasan hasil LLM
 *   2. transcript     - hasil Whisper (suara dosen)
 *   3. pdfText        - lapisan teks PDF
 *   4. visionKnowledge- isi gambar/diagram pada PDF
 *   5. videoKnowledge - isi slide yang tampil di video
 *
 * Setiap bagian diberi penanda sumber (misal "[PDF - Halaman 4]")
 * agar tetap dapat dilacak setelah dipotong menjadi chunk. Penanda ini
 * berguna untuk memberi feedback bersitasi kepada mahasiswa.
 * =====================================================================
 */

const MAX_VISION_PAGES = Number(process.env.PDF_MAX_VISION_PAGES || 12);
const MAX_VIDEO_FRAMES = Number(process.env.VIDEO_MAX_FRAMES || 8);

const EKSTENSI_GAMBAR = [".jpg", ".jpeg", ".png", ".webp", ".bmp"];
const EKSTENSI_VIDEO = [".mp4", ".mkv", ".mov", ".avi", ".webm", ".m4v"];

/**
 * @param {Object} materi objek materi dari Prisma
 * @returns {Promise<Object>}
 */
async function extractMateri(materi) {

    const summary = materi.summary || "";
    const transcript = materi.transcript || "";

    let pdfText = "";
    let visionKnowledge = "";
    let videoKnowledge = "";

    const sections = [];

    // =================================================================
    // BAGIAN 1 : FILE (PDF / GAMBAR)
    // =================================================================

    if (materi.fileUrl) {

        const filePath = resolveLocalPath(materi.fileUrl);
        const ext = getExtension(materi.fileUrl);

        if (!filePath) {
            console.warn("[extractor] File materi tidak dapat diakses:", materi.fileUrl);
        }
        else if (ext === ".pdf") {

            const hasilPdf = await prosesPdf(filePath);

            pdfText = hasilPdf.pdfText;
            visionKnowledge = hasilPdf.visionKnowledge;

            sections.push(...hasilPdf.sections);
        }
        else if (EKSTENSI_GAMBAR.includes(ext)) {

            try {

                const hasil = await describeImage(filePath);

                visionKnowledge = hasil || "";

                if (visionKnowledge.trim()) {
                    sections.push({
                        label: "[GAMBAR MATERI]",
                        content: visionKnowledge
                    });
                }

            } catch (err) {
                console.error("[extractor] Vision gambar gagal:", err.message);
            }
        }
        else {
            console.log("[extractor] Tipe file belum didukung:", ext);
        }
    }

    // =================================================================
    // BAGIAN 2 : VIDEO (KEYFRAME / SLIDE)
    // =================================================================

    if (materi.videoUrl) {

        const videoPath = resolveLocalPath(materi.videoUrl);
        const ext = getExtension(materi.videoUrl);

        if (videoPath && EKSTENSI_VIDEO.includes(ext)) {

            const hasilVideo = await prosesVideo(videoPath);

            videoKnowledge = hasilVideo.videoKnowledge;

            sections.push(...hasilVideo.sections);
        }
        else if (!videoPath) {
            console.warn("[extractor] Video tidak dapat diakses:", materi.videoUrl);
        }
    }

    // =================================================================
    // BAGIAN 3 : GABUNGKAN
    // =================================================================

    const blok = [];

    if (summary.trim()) {
        blok.push(`[RINGKASAN MATERI]\n${summary.trim()}`);
    }

    if (transcript.trim()) {
        blok.push(`[TRANSKRIP VIDEO]\n${transcript.trim()}`);
    }

    for (const section of sections) {
        if (section.content && section.content.trim()) {
            blok.push(`${section.label}\n${section.content.trim()}`);
        }
    }

    const knowledge = blok.join("\n\n");

    console.log("========== HASIL EKSTRAKSI ==========");
    console.log("Materi          :", materi.nama);
    console.log("Ringkasan       :", summary.length, "karakter");
    console.log("Transkrip       :", transcript.length, "karakter");
    console.log("Teks PDF        :", pdfText.length, "karakter");
    console.log("Vision PDF      :", visionKnowledge.length, "karakter");
    console.log("Vision Video    :", videoKnowledge.length, "karakter");
    console.log("Total Knowledge :", knowledge.length, "karakter");
    console.log("=====================================");

    return {
        transcript,
        summary,
        pdfText,
        visionKnowledge,
        videoKnowledge,
        sections,
        knowledge
    };
}

/**
 * Memproses satu file PDF: ambil teks per halaman, tentukan halaman
 * yang mengandung visual, render halaman tersebut, lalu baca dengan vision.
 */
async function prosesPdf(pdfPath) {

    const sections = [];

    let pdfText = "";
    let visionKnowledge = "";

    // -----------------------------------------------------------------
    // Analisis halaman
    // -----------------------------------------------------------------

    let analysis = [];

    try {
        analysis = await analyzePDF(pdfPath);
    } catch (err) {
        console.error("[extractor] Analisis PDF gagal:", err.message);
    }

    if (analysis.length > 0) {

        // Teks diambil per halaman agar dapat diberi penanda halaman.
        for (const halaman of analysis) {

            if (halaman.text && halaman.text.trim().length > 20) {

                sections.push({
                    label: `[PDF - Halaman ${halaman.page}]`,
                    content: halaman.text.trim()
                });
            }
        }

        pdfText = analysis
            .map(halaman => halaman.text)
            .filter(Boolean)
            .join("\n\n");

        console.log("========== ANALISIS HALAMAN PDF ==========");

        for (const halaman of analysis) {
            console.log(
                `Halaman ${halaman.page} | teks ${halaman.textLength} | ` +
                `skor ${halaman.score} | vision: ${halaman.needVision ? "YA" : "tidak"} | ${halaman.reason}`
            );
        }

        console.log("==========================================");
    }

    // Cadangan bila pdfjs gagal membaca lapisan teks
    if (!pdfText.trim()) {
        pdfText = await extractTextFromPDF(pdfPath);

        if (pdfText.trim()) {
            sections.push({
                label: "[PDF - Teks]",
                content: pdfText.trim()
            });
        }
    }

    // -----------------------------------------------------------------
    // Pilih halaman yang perlu vision
    // -----------------------------------------------------------------

    const halamanVisual = analysis
        .filter(halaman => halaman.needVision)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_VISION_PAGES)
        .map(halaman => halaman.page)
        .sort((a, b) => a - b);

    if (halamanVisual.length === 0) {
        console.log("[extractor] Tidak ada halaman yang perlu dibaca vision.");
        return { pdfText, visionKnowledge, sections };
    }

    console.log("[extractor] Halaman untuk vision:", halamanVisual.join(", "));

    // -----------------------------------------------------------------
    // Render + vision
    // -----------------------------------------------------------------

    let rendered = [];

    try {

        rendered = await renderPdfPages(pdfPath, halamanVisual);

        for (const item of rendered) {

            try {

                console.log(`[extractor] Vision halaman ${item.page}...`);

                const hasil = await describeImage(item.file);

                if (hasil && hasil.trim()) {

                    visionKnowledge += `\n\n${hasil.trim()}`;

                    sections.push({
                        label: `[PDF - Halaman ${item.page} - Isi Visual]`,
                        content: hasil.trim()
                    });
                }

            } catch (err) {
                console.error(
                    `[extractor] Vision halaman ${item.page} gagal:`,
                    err.message
                );
            }
        }

    } catch (err) {

        console.error("[extractor] Render PDF gagal:", err.message);

        // Jejak lengkap dicetak agar sumber galat dapat ditelusuri.
        // Tanpa ini, galat dari pustaka pihak ketiga hanya tampak sebagai
        // satu baris pesan tanpa keterangan fungsi mana yang melemparnya.
        console.error("[extractor] JEJAK LENGKAP:\n", err.stack);

    } finally {
        cleanupRendered(rendered);
    }

    return {
        pdfText,
        visionKnowledge: visionKnowledge.trim(),
        sections
    };
}

/**
 * Memproses video: ambil keyframe saat tampilan berganti,
 * lalu baca isi tiap frame dengan vision.
 */
async function prosesVideo(videoPath) {

    const sections = [];

    let videoKnowledge = "";

    let frames = [];

    try {

        frames = await extractKeyframes(videoPath, {
            maxFrames: MAX_VIDEO_FRAMES
        });

        for (const frame of frames) {

            try {

                const waktu = formatTimestamp(frame.time);

                console.log(`[extractor] Vision frame video ${waktu}...`);

                const hasil = await describeImage(frame.file);

                if (hasil && hasil.trim()) {

                    videoKnowledge += `\n\n${hasil.trim()}`;

                    sections.push({
                        label: `[VIDEO - Menit ${waktu} - Isi Layar]`,
                        content: hasil.trim()
                    });
                }

            } catch (err) {
                console.error(
                    `[extractor] Vision frame ${frame.time}s gagal:`,
                    err.message
                );
            }
        }

    } catch (err) {
        console.error("[extractor] Ekstraksi frame video gagal:", err.message);
    } finally {
        cleanupFrames(frames);
    }

    return {
        videoKnowledge: videoKnowledge.trim(),
        sections
    };
}

/**
 * Ekstraksi teks PDF menggunakan pdf-parse (cadangan).
 *
 * PENTING:
 * pdf-parse versi 2 TIDAK lagi mengekspor sebuah fungsi, melainkan
 * class PDFParse. Pemanggilan gaya lama, yaitu:
 *
 *     const pdfParse = require("pdf-parse");
 *     await pdfParse(buffer);
 *
 * akan melempar "pdfParse is not a function". Bila pemanggilan itu
 * berada di dalam try/catch yang mengembalikan string kosong, kegagalan
 * tersebut tidak terlihat sama sekali dan teks PDF selalu kosong.
 *
 * Fungsi di bawah mendukung kedua versi.
 */
async function extractTextFromPDF(pdfPath) {

    try {

        if (!pdfPath || !fs.existsSync(pdfPath)) return "";

        const modul = require("pdf-parse");

        // ---- pdf-parse versi 2 ----
        if (modul && typeof modul.PDFParse === "function") {

            const parser = new modul.PDFParse({
                data: new Uint8Array(fs.readFileSync(pdfPath))
            });

            try {
                const hasil = await parser.getText();
                return hasil.text || "";
            } finally {
                await parser.destroy();
            }
        }

        // ---- pdf-parse versi 1 ----
        const fungsi =
            typeof modul === "function"
                ? modul
                : (modul && typeof modul.default === "function" ? modul.default : null);

        if (fungsi) {
            const pdf = await fungsi(fs.readFileSync(pdfPath));
            return pdf.text || "";
        }

        console.warn("[extractor] API pdf-parse tidak dikenali.");

        return "";

    } catch (err) {
        console.error("[extractor] pdf-parse gagal:", err.message);
        return "";
    }
}

module.exports = {
    extractMateri,
    extractTextFromPDF,
    describeImage
};

/**
 * DIAGNOSA RENDER PDF
 *
 * Menjalankan perenderan satu halaman sambil mencetak seluruh informasi
 * yang diperlukan untuk menemukan penyebab kegagalan.
 *
 * Cara pakai, dari folder backend:
 *
 *   node diagnosaRender.js public/uploads/testpdf/materi1.pdf 5
 *
 * Argumen kedua adalah nomor halaman, boleh dikosongkan (default 5).
 */

const fs = require("fs");
const path = require("path");

const berkasPdf = process.argv[2];
const nomorHalaman = Number(process.argv[3] || 5);

if (!berkasPdf) {
    console.error("\nGunakan: node diagnosaRender.js <path-pdf> [nomor-halaman]\n");
    process.exit(1);
}

function garis(judul) {
    console.log("\n" + "=".repeat(60));
    console.log(judul);
    console.log("=".repeat(60));
}

function versiPaket(nama, dariFolder) {

    try {

        const opsi = dariFolder ? { paths: [dariFolder] } : undefined;

        const jalur = require.resolve(`${nama}/package.json`, opsi);

        return {
            versi: require(jalur).version,
            jalur: jalur
        };

    } catch (err) {
        return { versi: null, jalur: null, galat: err.message };
    }
}

(async () => {

    // -----------------------------------------------------------------
    // 1. Lingkungan
    // -----------------------------------------------------------------

    garis("1. LINGKUNGAN");

    console.log("Node        :", process.version);
    console.log("Platform    :", process.platform, process.arch);
    console.log("Folder kerja:", process.cwd());

    // -----------------------------------------------------------------
    // 2. Versi paket
    // -----------------------------------------------------------------

    garis("2. VERSI PAKET");

    const pdfjs = versiPaket("pdfjs-dist");
    console.log("pdfjs-dist  :", pdfjs.versi, "\n  ->", pdfjs.jalur);

    const napiAtas = versiPaket("@napi-rs/canvas");
    console.log("\n@napi-rs/canvas (level atas):", napiAtas.versi);
    console.log("  ->", napiAtas.jalur || napiAtas.galat);

    if (pdfjs.jalur) {

        const napiNested = versiPaket(
            "@napi-rs/canvas",
            path.dirname(pdfjs.jalur)
        );

        console.log("\n@napi-rs/canvas (dilihat dari pdfjs):", napiNested.versi);
        console.log("  ->", napiNested.jalur || napiNested.galat);

        if (napiAtas.versi && napiNested.versi && napiAtas.versi !== napiNested.versi) {
            console.log("\n  PERHATIAN: terdapat DUA versi berbeda.");
        }
    }

    const nodeCanvas = versiPaket("canvas");
    console.log("\ncanvas (node-canvas):", nodeCanvas.versi);

    // -----------------------------------------------------------------
    // 3. Uji canvas secara langsung
    // -----------------------------------------------------------------

    garis("3. UJI CANVAS LANGSUNG");

    try {

        const napi = require("@napi-rs/canvas");

        console.log("createCanvas :", typeof napi.createCanvas);
        console.log("Path2D       :", typeof napi.Path2D);
        console.log("GlobalFonts  :", typeof napi.GlobalFonts);

        const c = napi.createCanvas(100, 100);
        const ctx = c.getContext("2d");

        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 100, 100);

        console.log("createCanvas berhasil, ukuran:", c.width + "x" + c.height);

        // Uji Path2D, karena inilah yang dicurigai bermasalah
        if (typeof napi.Path2D === "function") {

            const p = new napi.Path2D();
            p.rect(10, 10, 50, 50);

            try {
                ctx.fill(p);
                console.log("ctx.fill(Path2D) berhasil");
            } catch (err) {
                console.log("ctx.fill(Path2D) GAGAL:", err.message);
            }

        } else {
            console.log("Path2D TIDAK tersedia pada versi ini.");
        }

        const buf = typeof c.toBuffer === "function"
            ? c.toBuffer("image/png")
            : c.encodeSync("png");

        console.log("Pengambilan buffer berhasil, ukuran:", buf.length, "bytes");

    } catch (err) {
        console.log("Uji canvas GAGAL:", err.message);
    }

    // -----------------------------------------------------------------
    // 4. Uji render melalui pdfjs
    // -----------------------------------------------------------------

    garis("4. UJI RENDER PDFJS");

    if (!fs.existsSync(berkasPdf)) {
        console.log("Berkas PDF tidak ditemukan:", berkasPdf);
        return;
    }

    try {

        const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");

        console.log("pdfjs berhasil dimuat, versi:", lib.version);

        const data = new Uint8Array(fs.readFileSync(berkasPdf));

        const task = lib.getDocument({ data, isEvalSupported: false });
        const pdf = await task.promise;

        console.log("Jumlah halaman:", pdf.numPages);
        console.log("canvasFactory tersedia:", !!(pdf.canvasFactory));

        if (pdf.canvasFactory) {
            console.log("  tipe:", pdf.canvasFactory.constructor
                ? pdf.canvasFactory.constructor.name
                : "tidak diketahui");
        }

        const page = await pdf.getPage(nomorHalaman);
        const vp = page.getViewport({ scale: 2 });

        console.log(`\nMerender halaman ${nomorHalaman}, ukuran ${Math.ceil(vp.width)}x${Math.ceil(vp.height)}`);

        // ---- Percobaan A: canvas factory pdfjs ----
        console.log("\n--- Percobaan A: canvas factory pdfjs ---");

        try {

            const dibuat = pdf.canvasFactory.create(
                Math.ceil(vp.width),
                Math.ceil(vp.height)
            );

            await page.render({
                canvasContext: dibuat.context,
                viewport: vp
            }).promise;

            const buf = typeof dibuat.canvas.toBuffer === "function"
                ? dibuat.canvas.toBuffer("image/png")
                : dibuat.canvas.encodeSync("png");

            fs.writeFileSync("diagnosa-A.png", buf);

            console.log("BERHASIL -> diagnosa-A.png (" + buf.length + " bytes)");

        } catch (err) {
            console.log("GAGAL:", err.message);
            console.log("\nJEJAK LENGKAP:");
            console.log(err.stack);
        }

        // ---- Percobaan B: canvas dibuat sendiri ----
        console.log("\n--- Percobaan B: canvas dibuat sendiri ---");

        try {

            const napi = require("@napi-rs/canvas");

            const c = napi.createCanvas(
                Math.ceil(vp.width),
                Math.ceil(vp.height)
            );

            const ctx = c.getContext("2d");

            const page2 = await pdf.getPage(nomorHalaman);

            await page2.render({
                canvasContext: ctx,
                viewport: page2.getViewport({ scale: 2 })
            }).promise;

            const buf = typeof c.toBuffer === "function"
                ? c.toBuffer("image/png")
                : c.encodeSync("png");

            fs.writeFileSync("diagnosa-B.png", buf);

            console.log("BERHASIL -> diagnosa-B.png (" + buf.length + " bytes)");

        } catch (err) {
            console.log("GAGAL:", err.message);
        }

        // ---- Percobaan C: node-canvas ----
        console.log("\n--- Percobaan C: node-canvas ---");

        try {

            const nc = require("canvas");

            const c = nc.createCanvas(
                Math.ceil(vp.width),
                Math.ceil(vp.height)
            );

            const ctx = c.getContext("2d");

            const page3 = await pdf.getPage(nomorHalaman);

            await page3.render({
                canvasContext: ctx,
                viewport: page3.getViewport({ scale: 2 })
            }).promise;

            fs.writeFileSync("diagnosa-C.png", c.toBuffer("image/png"));

            console.log("BERHASIL -> diagnosa-C.png");

        } catch (err) {
            console.log("GAGAL:", err.message);
        }

        await task.destroy();

    } catch (err) {
        console.log("Kesalahan umum:", err.message);
        console.log(err.stack);
    }

    garis("SELESAI");
    console.log("Kirimkan SELURUH keluaran di atas.\n");

})();

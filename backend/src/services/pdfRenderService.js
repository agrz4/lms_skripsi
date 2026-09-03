const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

/**
 * =====================================================================
 * PDF RENDER SERVICE
 * =====================================================================
 *
 * Merender halaman PDF menjadi gambar PNG menggunakan pdfjs-dist +
 * canvas, sepenuhnya di dalam Node.js.
 *
 * Versi sebelumnya memanggil binary eksternal "pdftoppm" (poppler-utils)
 * yang tidak tersedia secara default di Windows, sehingga proses render
 * selalu gagal dan vision tidak pernah berjalan.
 * =====================================================================
 */

// ---------------------------------------------------------------------
// Loader canvas (mendukung @napi-rs/canvas maupun node-canvas)
// ---------------------------------------------------------------------

let canvasLib = null;

/**
 * Memuat pustaka canvas yang cocok dengan pdfjs.
 *
 * PENTING:
 * pdfjs-dist versi 6 membawa @napi-rs/canvas versinya sendiri di dalam
 * foldernya. Bila project memiliki @napi-rs/canvas versi lain yang lebih
 * lama pada level atas node_modules, pemanggilan require biasa akan
 * mengambil yang lama, dan perenderan gagal dengan galat:
 *
 *     Value is none of these types `String`, `Path`
 *
 * Galat tersebut muncul karena pdfjs versi baru meneruskan objek Path2D
 * ke fungsi seperti clip() dan fill(), sedangkan versi canvas yang lama
 * belum mengenalinya. Deteksi halaman tetap berhasil karena tidak
 * menyentuh canvas sama sekali, sehingga kegagalan hanya tampak pada
 * tahap render.
 *
 * Karena itu urutan pencariannya:
 *   1. @napi-rs/canvas yang dibawa pdfjs-dist  (paling terjamin cocok)
 *   2. @napi-rs/canvas pada level atas
 *   3. canvas (node-canvas) sebagai cadangan
 */
function getCanvasLib() {

    if (canvasLib) return canvasLib;

    const kandidat = [];

    // 1. Versi yang dibawa pdfjs-dist
    try {

        const pdfjsRoot = path.dirname(
            require.resolve("pdfjs-dist/package.json")
        );

        kandidat.push({
            nama: "@napi-rs/canvas (bawaan pdfjs-dist)",
            jalur: require.resolve("@napi-rs/canvas", { paths: [pdfjsRoot] })
        });

    } catch {
        // pdfjs tidak membawa canvas sendiri, lanjut ke kandidat berikutnya
    }

    // 2. Versi pada level atas
    kandidat.push({ nama: "@napi-rs/canvas", jalur: "@napi-rs/canvas" });

    // 3. node-canvas
    kandidat.push({ nama: "canvas", jalur: "canvas" });

    for (const item of kandidat) {

        try {

            const lib = require(item.jalur);

            if (lib && typeof lib.createCanvas === "function") {
                console.log(`[pdfRender] Menggunakan pustaka canvas: ${item.nama}`);
                canvasLib = lib;
                return canvasLib;
            }

        } catch {
            // coba kandidat berikutnya
        }
    }

    throw new Error(
        "Pustaka canvas tidak ditemukan. Jalankan: npm install @napi-rs/canvas@latest"
    );
}

// ---------------------------------------------------------------------
// Loader pdfjs (ESM, di-cache agar tidak di-import berulang)
// ---------------------------------------------------------------------

/**
 * Menyelaraskan objek global Path2D dan DOMMatrix dengan pustaka canvas
 * yang akan dipakai.
 *
 * LATAR BELAKANG:
 * Pada lingkungan Node, pdfjs memerlukan Path2D dan DOMMatrix yang tidak
 * tersedia secara bawaan. Karena itu pdfjs memasangnya sendiri, tetapi
 * HANYA bila belum terpasang:
 *
 *     if (!globalThis.Path2D) { globalThis.Path2D = canvas.Path2D; }
 *
 * Pustaka lain yang membawa salinan pdfjs sendiri, misalnya pdf-parse,
 * menjalankan pemasangan serupa saat pertama kali di-require. Bila
 * pustaka tersebut dimuat lebih dahulu, globalThis.Path2D sudah terisi
 * objek milik salinan pdfjs lain.
 *
 * Akibatnya pdfjs membentuk glif huruf memakai Path2D dari salinan lain,
 * sementara context canvas berasal dari salinan kita. Keduanya adalah
 * kelas yang berbeda meskipun versinya sama, sehingga perenderan gagal
 * pada penggambaran huruf dengan galat:
 *
 *     Value is none of these types `String`, `Path`
 *
 * Kegagalan ini hanya muncul ketika dijalankan di dalam aplikasi, dan
 * tidak muncul bila pdfjs dipanggil sendirian, karena bergantung pada
 * modul mana yang dimuat lebih dahulu.
 *
 * Penyelarasan di bawah memastikan Path2D dan DOMMatrix berasal dari
 * pustaka canvas yang sama dengan yang dipakai untuk merender.
 */
function selaraskanGlobalCanvas() {

    let lib;

    try {
        lib = getCanvasLib();
    } catch (err) {
        console.warn("[pdfRender] Pustaka canvas belum tersedia:", err.message);
        return;
    }

    if (lib.Path2D && globalThis.Path2D !== lib.Path2D) {

        if (globalThis.Path2D) {
            console.log("[pdfRender] Menyelaraskan Path2D dengan pustaka canvas yang dipakai.");
        }

        globalThis.Path2D = lib.Path2D;
    }

    if (lib.DOMMatrix && globalThis.DOMMatrix !== lib.DOMMatrix) {
        globalThis.DOMMatrix = lib.DOMMatrix;
    }

    if (lib.ImageData && !globalThis.ImageData) {
        globalThis.ImageData = lib.ImageData;
    }
}

let pdfjsPromise = null;

function loadPdfjs() {

    if (!pdfjsPromise) {

        // Penyelarasan harus dilakukan SEBELUM pdfjs dimuat, karena
        // pemasangan global oleh pdfjs terjadi saat modulnya dimuat.
        selaraskanGlobalCanvas();

        pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs");
    }

    return pdfjsPromise;
}

/**
 * Lokasi font standar & cMap bawaan pdfjs.
 * Tanpa ini pdfjs memunculkan warning dan sebagian teks tidak ikut ter-render.
 *
 * PENTING (Windows):
 * pdfjs mewajibkan nilai ini diakhiri garis miring "/" dan menolak pemisah
 * folder gaya Windows. Memakai path.sep akan menghasilkan
 * "C:\...\cmaps\" dan pdfjs melempar:
 *
 *     Invalid factory url: "..." must include trailing slash.
 *
 * Karena itu seluruh backslash diubah menjadi garis miring, lalu ditambahkan
 * satu garis miring di akhir. Hasilnya "C:/.../cmaps/", yang diterima pdfjs
 * dan tetap dapat dibaca oleh fs pada Windows.
 *
 * Catatan: jangan memakai pathToFileURL() di sini. Bentuk "file:///C:/..."
 * memang lolos validasi, tetapi pembaca font bawaan pdfjs di Node membacanya
 * lewat filesystem, sehingga muncul "Unable to load font data at ...".
 */
function toAssetUrl(direktori) {

    return direktori
        .replace(/\\/g, "/")
        .replace(/\/?$/, "/");
}

function getPdfjsAssets() {

    try {

        const root = path.dirname(
            require.resolve("pdfjs-dist/package.json")
        );

        const fontDir = path.join(root, "standard_fonts");
        const cmapDir = path.join(root, "cmaps");

        const assets = {};

        if (fs.existsSync(fontDir)) {
            assets.standardFontDataUrl = toAssetUrl(fontDir);
        }

        if (fs.existsSync(cmapDir)) {
            assets.cMapUrl = toAssetUrl(cmapDir);
            assets.cMapPacked = true;
        }

        return assets;

    } catch (err) {
        console.warn("[pdfRender] Aset pdfjs tidak ditemukan:", err.message);
        return {};
    }
}

/**
 * Mengambil buffer PNG dari objek canvas.
 *
 * Nama fungsinya berbeda antar pustaka: node-canvas memakai toBuffer,
 * sedangkan @napi-rs/canvas menyediakan toBuffer maupun encodeSync.
 */
function ambilBufferPng(canvas) {

    if (typeof canvas.toBuffer === "function") {
        return canvas.toBuffer("image/png");
    }

    if (typeof canvas.encodeSync === "function") {
        return canvas.encodeSync("png");
    }

    throw new Error("Objek canvas tidak mendukung pengambilan buffer PNG.");
}

/**
 * Membuka dokumen PDF.
 *
 * @param {string} pdfPath path absolut file PDF
 * @returns {Promise<{pdf: object, loadingTask: object, pdfjs: object}>}
 */
async function openPdf(pdfPath, opsi = {}) {

    const { pakaiAset = true } = opsi;

    const pdfjs = await loadPdfjs();

    const data = new Uint8Array(
        fs.readFileSync(pdfPath)
    );

    const loadingTask = pdfjs.getDocument({
        data,
        isEvalSupported: false,
        ...(pakaiAset ? getPdfjsAssets() : {})
    });

    const pdf = await loadingTask.promise;

    return { pdf, loadingTask, pdfjs };
}

/**
 * Membuat folder sementara khusus satu proses render.
 */
function createTempDir(prefix = "materi_pdf") {

    const dir = path.join(
        os.tmpdir(),
        `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    );

    fs.mkdirSync(dir, { recursive: true });

    return dir;
}

/**
 * Merender daftar halaman PDF menjadi file PNG.
 *
 * @param {string} pdfPath        path absolut file PDF
 * @param {number[]} pageNumbers  nomor halaman (mulai dari 1)
 * @param {object} options
 * @param {number} options.targetWidth  lebar gambar hasil render (px)
 * @param {string} options.outputDir    folder output (default: temp folder baru)
 * @returns {Promise<Array<{page:number, file:string, width:number, height:number}>>}
 */
async function renderPdfPages(pdfPath, pageNumbers, options = {}) {

    const {
        targetWidth = 1400,
        outputDir = createTempDir()
    } = options;

    if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF tidak ditemukan: ${pdfPath}`);
    }

    if (!Array.isArray(pageNumbers) || pageNumbers.length === 0) {
        return [];
    }

    // createTempDir() sudah membuat foldernya sendiri, tetapi bila pemanggil
    // menentukan outputDir secara manual folder itu belum tentu ada.
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // ------------------------------------------------------------------
    // Dua percobaan.
    //
    // Percobaan pertama menyertakan standardFontDataUrl dan cMapUrl agar
    // font bawaan PDF ter-render dengan tepat.
    //
    // Pada sebagian sistem, khususnya Windows, penyertaan tersebut justru
    // menggagalkan perenderan dengan galat:
    //
    //     Value is none of these types `String`, `Path`
    //
    // Penyebabnya, nilai seperti "C:/.../standard_fonts/" dapat
    // ditafsirkan sebagai URL dengan skema "c:", sehingga pemuat font
    // menerima nilai yang tidak dikenali.
    //
    // Karena itu, bila percobaan pertama gagal, perenderan diulang tanpa
    // aset font. Hasilnya tetap terbaca, hanya sebagian font digantikan
    // font pengganti, dan itu tidak memengaruhi pembacaan oleh model
    // vision.
    // ------------------------------------------------------------------

    try {
        return await renderInternal(pdfPath, pageNumbers, targetWidth, outputDir, true);
    } catch (err) {

        console.warn("[pdfRender] Render dengan aset font gagal:", err.message);
        console.warn("[pdfRender] JEJAK:", err.stack);
        console.warn("[pdfRender] Mengulang tanpa aset font...");

        return await renderInternal(pdfPath, pageNumbers, targetWidth, outputDir, false);
    }
}

/**
 * Pelaksana perenderan yang sesungguhnya.
 */
async function renderInternal(pdfPath, pageNumbers, targetWidth, outputDir, pakaiAset) {

    const { pdf, loadingTask } = await openPdf(pdfPath, { pakaiAset });

    // ------------------------------------------------------------------
    // Sumber canvas.
    //
    // pdfjs dimuat sebagai modul ESM melalui import(), sedangkan pustaka
    // canvas dimuat sebagai modul CJS melalui require(). Keduanya berada
    // pada registry modul yang berbeda, sehingga objek Path2D yang
    // dibuat pdfjs TIDAK dikenali oleh context canvas yang kita buat
    // sendiri. Akibatnya perenderan gagal dengan galat:
    //
    //     Value is none of these types `String`, `Path`
    //
    // Menariknya, deteksi halaman tetap berhasil karena tidak menyentuh
    // canvas sama sekali, sehingga kegagalan hanya tampak pada tahap
    // render dan mudah disalahartikan sebagai masalah versi pustaka.
    //
    // Solusinya memakai canvas factory bawaan pdfjs, sehingga canvas dan
    // objek Path2D berasal dari instance modul yang sama.
    // ------------------------------------------------------------------

    const factory =
        pdf.canvasFactory && typeof pdf.canvasFactory.create === "function"
            ? pdf.canvasFactory
            : null;

    let createCanvas = null;

    if (factory) {
        console.log("[pdfRender] Memakai canvas factory bawaan pdfjs.");
    } else {
        createCanvas = getCanvasLib().createCanvas;
    }

    const hasil = [];

    try {

        for (const pageNumber of pageNumbers) {

            if (pageNumber < 1 || pageNumber > pdf.numPages) {
                console.warn(`[pdfRender] Halaman ${pageNumber} di luar jangkauan.`);
                continue;
            }

            const page = await pdf.getPage(pageNumber);

            // Skala dihitung agar lebar hasil render konsisten,
            // berapa pun ukuran kertas aslinya.
            const baseViewport = page.getViewport({ scale: 1 });

            const scale = Math.max(
                1,
                Math.min(3, targetWidth / baseViewport.width)
            );

            const viewport = page.getViewport({ scale });

            const lebar = Math.ceil(viewport.width);
            const tinggi = Math.ceil(viewport.height);

            let dibuat = null;
            let canvas;
            let context;

            if (factory) {
                dibuat = factory.create(lebar, tinggi);
                canvas = dibuat.canvas;
                context = dibuat.context;
            } else {
                canvas = createCanvas(lebar, tinggi);
                context = canvas.getContext("2d");
            }

            // Latar putih diserahkan kepada pdfjs melalui opsi background.
            //
            // Versi sebelumnya mengisi latar sendiri menggunakan
            // context.fillStyle dan context.fillRect sebelum perenderan.
            // Pengisian manual tersebut menyentuh context milik pdfjs dari
            // luar, dan pada sebagian sistem menyebabkan perenderan gagal
            // dengan galat:
            //
            //     Value is none of these types `String`, `Path`
            //
            // Opsi background merupakan cara resmi pdfjs untuk menetapkan
            // warna latar, sehingga pengisian dilakukan pdfjs sendiri
            // menggunakan objek internalnya.
            await page.render({
                canvasContext: context,
                viewport,
                background: "#ffffff"
            }).promise;

            const file = path.join(
                outputDir,
                `page_${String(pageNumber).padStart(3, "0")}.png`
            );

            fs.writeFileSync(file, ambilBufferPng(canvas));

            page.cleanup();

            if (factory && dibuat && typeof factory.destroy === "function") {
                try {
                    factory.destroy(dibuat);
                } catch {
                    // pembebasan canvas bersifat opsional
                }
            }

            // Memakai nilai yang diminta, bukan canvas.width, karena
            // canvas factory pdfjs mengembalikan objek ke ukuran bawaan
            // setelah dibebaskan.
            hasil.push({
                page: pageNumber,
                file,
                width: lebar,
                height: tinggi
            });

            console.log(`[pdfRender] Halaman ${pageNumber} -> ${file}`);
        }

    } finally {

        try {
            await loadingTask.destroy();
        } catch {
            // abaikan
        }
    }

    return hasil;
}

/**
 * Menghapus folder hasil render sementara.
 */
function cleanupRendered(files = []) {

    const folders = new Set();

    for (const item of files) {

        const file = typeof item === "string" ? item : item.file;

        if (!file) continue;

        folders.add(path.dirname(file));
    }

    for (const folder of folders) {

        try {

            if (folder.startsWith(os.tmpdir())) {
                fs.rmSync(folder, { recursive: true, force: true });
            }

        } catch (err) {
            console.warn("[pdfRender] Gagal menghapus temp:", err.message);
        }
    }
}

module.exports = {
    openPdf,
    renderPdfPages,
    createTempDir,
    cleanupRendered
};

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { execFile } = require("child_process");
const util = require("util");

const execFileAsync = util.promisify(execFile);

/**
 * =====================================================================
 * VIDEO FRAME SERVICE
 * =====================================================================
 *
 * Mengambil "keyframe" dari video pembelajaran, yaitu frame pada saat
 * tampilan berganti (ganti slide, ganti tulisan papan, ganti diagram).
 *
 * Alasan keberadaannya:
 * Whisper hanya menangkap SUARA dosen. Bila dosen berkata
 * "perhatikan diagram berikut", isi diagramnya tidak pernah masuk ke
 * knowledge base. Frame hasil service ini dikirim ke model vision agar
 * isi slide ikut terekam.
 *
 * Membutuhkan ffmpeg & ffprobe terpasang dan terdaftar di PATH.
 * =====================================================================
 */

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

// ---------------------------------------------------------------------
// Canvas (untuk perceptual hash / deduplikasi frame)
// ---------------------------------------------------------------------

let canvasLib = null;

function getCanvasLib() {

    if (canvasLib) return canvasLib;

    try {
        canvasLib = require("@napi-rs/canvas");
    } catch {
        canvasLib = require("canvas");
    }

    return canvasLib;
}

/**
 * Memeriksa apakah ffmpeg tersedia.
 */
async function isFfmpegAvailable() {

    try {
        await execFileAsync(FFMPEG, ["-version"]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Mengambil durasi video dalam detik.
 */
async function getDuration(videoPath) {

    try {

        const { stdout } = await execFileAsync(FFPROBE, [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=nw=1:nk=1",
            videoPath
        ]);

        const durasi = parseFloat(String(stdout).trim());

        return Number.isFinite(durasi) ? durasi : 0;

    } catch (err) {
        console.warn("[videoFrame] Gagal membaca durasi:", err.message);
        return 0;
    }
}

/**
 * Mendeteksi detik-detik terjadinya pergantian tampilan (scene change).
 *
 * @param {string} videoPath
 * @param {number} threshold sensitivitas 0..1 (semakin kecil semakin peka)
 * @returns {Promise<number[]>} daftar timestamp dalam detik
 */
async function detectSceneTimestamps(videoPath, threshold = 0.3) {

    try {

        const { stderr, stdout } = await execFileAsync(
            FFMPEG,
            [
                "-i", videoPath,
                "-vf", `select='gt(scene,${threshold})',metadata=print:file=-`,
                "-an",
                "-f", "null",
                "-"
            ],
            {
                maxBuffer: 32 * 1024 * 1024
            }
        );

        const output = `${stdout || ""}\n${stderr || ""}`;

        const timestamps = [];

        const regex = /pts_time:([0-9.]+)/g;

        let match;

        while ((match = regex.exec(output)) !== null) {

            const detik = parseFloat(match[1]);

            if (Number.isFinite(detik)) {
                timestamps.push(detik);
            }
        }

        return timestamps;

    } catch (err) {
        console.warn("[videoFrame] Deteksi scene gagal:", err.message);
        return [];
    }
}

/**
 * Membuat timestamp cadangan dengan interval tetap,
 * dipakai bila deteksi scene tidak menghasilkan apa pun
 * (misalnya video rekaman layar yang berubah sangat halus).
 */
function buildFallbackTimestamps(durasi, jumlah) {

    if (durasi <= 0 || jumlah <= 0) return [];

    const hasil = [];

    const interval = durasi / (jumlah + 1);

    for (let i = 1; i <= jumlah; i++) {
        hasil.push(Number((interval * i).toFixed(2)));
    }

    return hasil;
}

/**
 * Mengambil satu frame pada detik tertentu.
 */
async function grabFrame(videoPath, detik, outputFile, width = 1280) {

    await execFileAsync(FFMPEG, [
        "-y",
        "-ss", String(detik),
        "-i", videoPath,
        "-frames:v", "1",
        "-vf", `scale='min(${width},iw)':-2`,
        outputFile
    ]);

    return fs.existsSync(outputFile) ? outputFile : null;
}

/**
 * Menghitung sidik visual sebuah gambar:
 * - dHash 256 bit (peka terhadap perbedaan tata letak & teks)
 * - rata-rata warna (peka terhadap perbedaan warna slide)
 *
 * Keduanya dipakai bersama karena dHash bekerja pada gradien keabuan,
 * sehingga dua gambar berwarna berbeda tetapi bertekstur sama
 * dapat menghasilkan hash yang identik.
 */
async function buildSignature(imagePath) {

    const { createCanvas, loadImage } = getCanvasLib();

    const image = await loadImage(imagePath);

    const lebar = 17;
    const tinggi = 16;

    const canvas = createCanvas(lebar, tinggi);
    const context = canvas.getContext("2d");

    context.drawImage(image, 0, 0, lebar, tinggi);

    const { data } = context.getImageData(0, 0, lebar, tinggi);

    let bits = "";

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;

    for (let y = 0; y < tinggi; y++) {

        for (let x = 0; x < lebar; x++) {

            const index = (y * lebar + x) * 4;

            totalR += data[index];
            totalG += data[index + 1];
            totalB += data[index + 2];

            if (x === lebar - 1) continue;

            const kanan = index + 4;

            const abuKiri = (data[index] + data[index + 1] + data[index + 2]) / 3;
            const abuKanan = (data[kanan] + data[kanan + 1] + data[kanan + 2]) / 3;

            bits += abuKiri > abuKanan ? "1" : "0";
        }
    }

    const jumlahPiksel = lebar * tinggi;

    return {
        bits,
        meanR: totalR / jumlahPiksel,
        meanG: totalG / jumlahPiksel,
        meanB: totalB / jumlahPiksel
    };
}

function hammingDistance(a, b) {

    let jarak = 0;

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) jarak++;
    }

    return jarak;
}

/**
 * Dua frame dianggap duplikat hanya bila susunan visualnya mirip
 * DAN warnanya juga mirip.
 */
function isDuplicateSignature(a, b, hashThreshold, colorThreshold) {

    const bedaSusunan = hammingDistance(a.bits, b.bits);

    const bedaWarna = Math.sqrt(
        Math.pow(a.meanR - b.meanR, 2) +
        Math.pow(a.meanG - b.meanG, 2) +
        Math.pow(a.meanB - b.meanB, 2)
    );

    return bedaSusunan <= hashThreshold && bedaWarna <= colorThreshold;
}

/**
 * Mengambil keyframe representatif dari sebuah video.
 *
 * @param {string} videoPath path absolut video
 * @param {object} options
 * @param {number} options.maxFrames     jumlah maksimum frame (default 8)
 * @param {number} options.sceneThreshold sensitivitas scene detection
 * @param {number} options.minGap        jarak minimal antar frame (detik)
 * @param {number} options.hashThreshold ambang beda susunan visual (0-256)
 * @param {number} options.colorThreshold ambang beda rata-rata warna
 * @returns {Promise<Array<{time:number, file:string}>>}
 */
async function extractKeyframes(videoPath, options = {}) {

    const {
        maxFrames = Number(process.env.VIDEO_MAX_FRAMES || 8),
        sceneThreshold = 0.3,
        minGap = 8,
        hashThreshold = 24,
        colorThreshold = 12,
        width = 1280
    } = options;

    if (!fs.existsSync(videoPath)) {
        throw new Error(`Video tidak ditemukan: ${videoPath}`);
    }

    if (!(await isFfmpegAvailable())) {
        console.warn("[videoFrame] ffmpeg tidak tersedia, ekstraksi frame dilewati.");
        return [];
    }

    const durasi = await getDuration(videoPath);

    console.log(`[videoFrame] Durasi video: ${durasi.toFixed(1)} detik`);

    // -----------------------------------------------------------------
    // 1. Kumpulkan kandidat timestamp
    // -----------------------------------------------------------------

    let kandidat = await detectSceneTimestamps(videoPath, sceneThreshold);

    console.log(`[videoFrame] Scene terdeteksi: ${kandidat.length}`);

    if (kandidat.length < 3) {

        const cadangan = buildFallbackTimestamps(
            durasi,
            Math.min(maxFrames, 5)
        );

        kandidat = [...kandidat, ...cadangan];

        console.log("[videoFrame] Menambahkan sampling interval tetap.");
    }

    // Selalu sertakan awal video (biasanya slide judul)
    if (durasi > 2) {
        kandidat.push(1.5);
    }

    // -----------------------------------------------------------------
    // 2. Urutkan, buang yang terlalu berdekatan, batasi jumlah
    // -----------------------------------------------------------------

    kandidat = [...new Set(kandidat.map(t => Number(t.toFixed(2))))]
        .sort((a, b) => a - b);

    const terpilih = [];

    for (const detik of kandidat) {

        if (detik < 0 || (durasi > 0 && detik > durasi - 0.3)) continue;

        const terakhir = terpilih[terpilih.length - 1];

        if (terakhir === undefined || detik - terakhir >= minGap) {
            terpilih.push(detik);
        }
    }

    const finalTimestamps = terpilih.slice(0, maxFrames * 2);

    // -----------------------------------------------------------------
    // 3. Ambil frame + buang duplikat visual
    // -----------------------------------------------------------------

    const outputDir = path.join(
        os.tmpdir(),
        `materi_video_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`
    );

    fs.mkdirSync(outputDir, { recursive: true });

    const hasil = [];
    const daftarSignature = [];

    for (const detik of finalTimestamps) {

        if (hasil.length >= maxFrames) break;

        const file = path.join(
            outputDir,
            `frame_${String(Math.round(detik)).padStart(5, "0")}.png`
        );

        try {

            const dihasilkan = await grabFrame(videoPath, detik, file, width);

            if (!dihasilkan) continue;

            const signature = await buildSignature(dihasilkan);

            const mirip = daftarSignature.some(
                sebelumnya => isDuplicateSignature(
                    sebelumnya,
                    signature,
                    hashThreshold,
                    colorThreshold
                )
            );

            if (mirip) {
                fs.unlinkSync(dihasilkan);
                console.log(`[videoFrame] Frame ${detik}s dilewati (duplikat).`);
                continue;
            }

            daftarSignature.push(signature);

            hasil.push({
                time: detik,
                file: dihasilkan
            });

            console.log(`[videoFrame] Frame diambil pada ${detik}s`);

        } catch (err) {
            console.warn(`[videoFrame] Gagal ambil frame ${detik}s:`, err.message);
        }
    }

    console.log(`[videoFrame] Total keyframe unik: ${hasil.length}`);

    return hasil;
}

/**
 * Menghapus folder sementara hasil ekstraksi frame.
 */
function cleanupFrames(frames = []) {

    const folders = new Set();

    for (const item of frames) {

        const file = typeof item === "string" ? item : item.file;

        if (file) folders.add(path.dirname(file));
    }

    for (const folder of folders) {

        try {

            if (folder.startsWith(os.tmpdir())) {
                fs.rmSync(folder, { recursive: true, force: true });
            }

        } catch (err) {
            console.warn("[videoFrame] Gagal hapus temp:", err.message);
        }
    }
}

/**
 * Mengubah detik menjadi format mm:ss agar mudah dirujuk pada feedback.
 */
function formatTimestamp(detik) {

    const total = Math.round(detik);

    const menit = Math.floor(total / 60);
    const sisa = total % 60;

    return `${String(menit).padStart(2, "0")}:${String(sisa).padStart(2, "0")}`;
}

module.exports = {
    extractKeyframes,
    cleanupFrames,
    formatTimestamp,
    isFfmpegAvailable,
    getDuration
};

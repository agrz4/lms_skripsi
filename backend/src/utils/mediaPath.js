const fs = require("fs");
const path = require("path");

/**
 * Root folder public backend.
 * Semua fileUrl / videoUrl yang tersimpan di database menunjuk ke sini.
 */
const PUBLIC_DIR = path.join(__dirname, "../../public");

/**
 * Mengubah fileUrl apa pun menjadi path lokal absolut.
 *
 * Menerima semua bentuk berikut:
 *   http://localhost:5000/public/uploads/documents/123.pdf
 *   https://domain.com/public/uploads/videos/abc.mp4
 *   /public/uploads/documents/123.pdf
 *   /uploads/documents/123.pdf
 *   uploads/documents/123.pdf
 *   C:\project\backend\public\uploads\documents\123.pdf
 *
 * @param {string} fileUrl
 * @returns {string|null} path absolut, atau null bila file tidak ada
 */
function resolveLocalPath(fileUrl) {

    if (!fileUrl || typeof fileUrl !== "string") return null;

    const raw = fileUrl.trim();

    // Sudah berupa path absolut di disk
    if (path.isAbsolute(raw) && fs.existsSync(raw)) {
        return raw;
    }

    let relative = raw
        .replace(/^https?:\/\/[^/]+/i, "")   // buang protokol + host + port
        .split(/[?#]/)[0]                    // buang query string
        .replace(/\\/g, "/");                // normalisasi pemisah Windows

    try {
        relative = decodeURIComponent(relative);
    } catch {
        // biarkan apa adanya bila bukan URI encoded
    }

    relative = relative
        .replace(/^\/?public\//i, "")        // buang prefix "public/"
        .replace(/^\/+/, "");                // buang slash di depan

    const fullPath = path.resolve(PUBLIC_DIR, relative);

    // Cegah path traversal (../../etc/passwd)
    if (!fullPath.startsWith(path.resolve(PUBLIC_DIR))) {
        console.warn("[mediaPath] Path di luar folder public ditolak:", fileUrl);
        return null;
    }

    if (!fs.existsSync(fullPath)) {
        console.warn("[mediaPath] File tidak ditemukan:", fullPath);
        return null;
    }

    return fullPath;
}

/**
 * Mengambil ekstensi file (lowercase, termasuk titik) dari URL atau path.
 */
function getExtension(fileUrl) {

    if (!fileUrl) return "";

    const clean = String(fileUrl).split(/[?#]/)[0];

    return path.extname(clean).toLowerCase();
}

module.exports = {
    PUBLIC_DIR,
    resolveLocalPath,
    getExtension
};

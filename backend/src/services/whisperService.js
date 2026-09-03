const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

/**
 * =====================================================================
 * WHISPER SERVICE
 * =====================================================================
 *
 */

const TRANSCRIBE_SCRIPT = path.join(__dirname, "../../transcribe.py");

const PYTHON = process.env.PYTHON_PATH ||
    (process.platform === "win32" ? "python" : "python3");

/**
 * Transkripsi file video/audio menggunakan Whisper.
 *
 * @param {string} videoPath path absolut file video
 * @returns {Promise<string>} teks hasil transkripsi
 */
function transcribeVideo(videoPath) {

    return new Promise((resolve, reject) => {

        if (!fs.existsSync(videoPath)) {
            return reject(new Error(`File tidak ditemukan: ${videoPath}`));
        }

        if (!fs.existsSync(TRANSCRIBE_SCRIPT)) {
            return reject(new Error(`Script tidak ditemukan: ${TRANSCRIBE_SCRIPT}`));
        }

        console.log("[whisper] Memulai transkripsi:", path.basename(videoPath));

        const proses = spawn(
            PYTHON,
            [TRANSCRIBE_SCRIPT, videoPath],
            { windowsHide: true }
        );

        let stdout = "";
        let stderr = "";

        proses.stdout.on("data", data => {
            stdout += data.toString();
        });

        proses.stderr.on("data", data => {
            stderr += data.toString();
        });

        proses.on("error", err => {
            reject(new Error(
                `Gagal menjalankan "${PYTHON}": ${err.message}. ` +
                `Atur variabel PYTHON_PATH bila perlu.`
            ));
        });

        proses.on("close", kode => {

            if (kode !== 0) {
                return reject(new Error(
                    `Whisper keluar dengan kode ${kode}: ${stderr.trim() || "tanpa pesan"}`
                ));
            }

            // Whisper kadang menulis log ke stdout sebelum JSON,
            // jadi ambil objek JSON terakhir yang muncul.
            const cocok = stdout.match(/\{[\s\S]*\}/);

            if (!cocok) {
                return reject(new Error(
                    "Keluaran Whisper tidak mengandung JSON: " + stdout.slice(0, 200)
                ));
            }

            try {

                const hasil = JSON.parse(cocok[0]);

                const teks = (hasil.text || "").trim();

                if (teks.startsWith("Error:")) {
                    return reject(new Error(teks));
                }

                console.log(`[whisper] Selesai, ${teks.length} karakter.`);

                resolve(teks);

            } catch (err) {
                reject(new Error("Gagal parse keluaran Whisper: " + err.message));
            }
        });
    });
}

module.exports = { transcribeVideo };

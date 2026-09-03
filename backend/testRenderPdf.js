const path = require("path");

const {
    renderPdfPages
} = require("./src/services/extractorService");

async function main() {

    const pdf = path.join(
        __dirname,
        "public",

        "testpdf",

        "materi1.pdf"
    );

    const pages = await renderPdfPages(
        pdf,
        [5, 8]
    );

    console.log("========== HASIL ==========");

    console.dir(
        pages,
        { depth: null }
    );

}

main();
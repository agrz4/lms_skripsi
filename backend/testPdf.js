const {
    loadPdfJs
} = require("./src/services/pdfService");

async function main() {

    const pdfjs = await loadPdfJs();

    console.log(Object.keys(pdfjs));

}

main();
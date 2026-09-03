async function loadPdfJs() {

    const pdfjs = await import(
        "pdfjs-dist/build/pdf.mjs"
    );

    return pdfjs;

}

module.exports = {

    loadPdfJs

};
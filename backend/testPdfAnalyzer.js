const path = require("path");

const {

    analyzePDF

} = require("./src/services/pdfAnalyzer");

async function main(){

    const pdf = path.join(

        __dirname,

        "public",

        "testpdf",

        "materi1.pdf"

    );

    const result =
        await analyzePDF(pdf);

    console.dir(
        result,
        { depth:null }
    );

}

main();
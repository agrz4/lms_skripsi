const path = require("path");

const {
    describeImage
} = require("./src/services/visionService");

async function main() {

    try {

        const imagePath = path.join(
            __dirname,
            "public",
            "test",
            "browser.png"
        );

        console.log("================================");
        console.log("TEST GEMMA VISION");
        console.log("================================");

        const result =
            await describeImage(imagePath);

        console.log(result);

    } catch (err) {

        console.error(err);

    }

}

main();
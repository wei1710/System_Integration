const fs = require("fs");
const path = require("path");

const BASE_FOLDER = path.join(__dirname, "..", "02_Text-based_Data_Formats");
const fileTypes = [".json", ".csv", ".xml", ".yaml", ".txt"];

function parseFile(filePath, ext) {
    const data = fs.readFileSync(filePath, "utf-8");

    if (ext === ".json") {
        return JSON.stringify(JSON.parse(data), null, 4);
    }
    return data;
}

function printDataStructure(data) {
    console.log(data);
}

function main() {
    fileTypes.forEach(ext => {
        const filePath = path.join(BASE_FOLDER, `me${ext}`);

        console.log(`\n--- ${path.basename(filePath)} ---`);
        const parsedData = parseFile(filePath, ext);
        printDataStructure(parsedData);
    });
}

main();
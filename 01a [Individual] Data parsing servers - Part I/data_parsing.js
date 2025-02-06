import { readFileSync } from "fs";
import { join } from "path";

const BASE_FOLDER = "../02_Text-based_Data_Formats";
const fileTypes = [".json", ".csv", ".xml", ".yaml", ".txt"];

fileTypes.forEach(ext => {
    const filePath = join(BASE_FOLDER, `me${ext}`);
    console.log(`\n--- me${ext} ---`);
    console.log(readFileSync(filePath, "utf-8"));
});
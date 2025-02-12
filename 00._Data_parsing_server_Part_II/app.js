import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const BASE_FOLDER = path.join("..", "02_Text-based_Data_Formats");
const FILE_NAME = "me";
const ENCODE = "utf-8";

app.get("/json", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.json`), ENCODE);
    res.json(JSON.parse(data));
});

app.get("/csv", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.csv`), ENCODE);
    res.send(`<pre>` + data + `</pre>`);
});

app.get("/xml", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.xml`), ENCODE);
    res.send(data);
});

app.get("/yaml", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.yaml`), ENCODE);
    res.send(data);
});

app.get("/txt", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.txt`), ENCODE);
    res.send(data);
});

const PORT = 8080;
app.listen(PORT, () => console.log("Server running on port", PORT));
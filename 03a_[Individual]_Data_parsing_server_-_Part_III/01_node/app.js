import express from "express";
import fs from "fs";
import path from "path";

const app = express();
const BASE_FOLDER = path.join("..", "..", "02_Text-based_Data_Formats");
const FILE_NAME = "me";
const ENCODE = "utf-8";
const BASE_URL = "http://127.0.0.1:8000";

app.get("/json", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.json`), ENCODE);
    res.send(JSON.parse(data));
});

app.get("/csv", (req, res) => {
    const data = fs.readFileSync(path.join(BASE_FOLDER, `${FILE_NAME}.csv`), ENCODE);
    res.send(`<pre>${data}</pre>`);
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

app.get("/get_json", async (req, res) => {
    const response = await fetch(`${BASE_URL}/json`);
    const result = await response.json();
    res.send(result)
});

app.get("/get_csv", async (req, res) => {
    const response = await fetch(`${BASE_URL}/csv`);
    const result = await response.text();
    res.send(`<pre>${result}</pre>`);
});

app.get("/get_xml", async (req, res) => {
    const response = await fetch(`${BASE_URL}/xml`);
    const result = await response.text();
    res.setHeader('Content-Type', 'text/xml');
    res.send(result);
});

app.get("/get_yaml", async (req, res) => {
    const response = await fetch(`${BASE_URL}/yaml`);
    const result = await response.text();
    res.setHeader('Content-Type', 'text/yaml');
    res.send(result);
});

app.get("/get_txt", async (req, res) => {
    const response = await fetch(`${BASE_URL}/txt`);
    const result = await response.text();
    res.setHeader('Content-Type', 'text/plain');
    res.send(result);
});

const PORT = 8080;
app.listen(PORT, () => console.log("Server running on port", PORT));
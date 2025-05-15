import { readFile, writeFile } from 'fs/promises';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBHOOKS_FILE = path.join(__dirname, "../webhooks.json");

export const sendWebhook = async (url, payload) => {
    console.log(`Attempting to send webhook to ${url} for event ${payload.event_type}`);
    try {
        await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 5000
        });
        console.log("Webhook sent successfully to", url);
    } catch (error) {
        console.error(`Failed to send webhook to ${url} for event ${payload.event_type}: ${error.message}`);
    }
};

export const readWebhooks = async () => {
    try {
        const data = await readFile(WEBHOOKS_FILE, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn(`Could not read or parse ${WEBHOOKS_FILE}. Treating as empty. Error: ${error.message}`);
        return [];
    }
};

export const writeWebhooks = async (webhooks) => {
    try {
        const data = JSON.stringify(webhooks, null, 2);
        await writeFile(WEBHOOKS_FILE, data, 'utf-8');
    } catch (error) {
        console.error(`Error writing ${WEBHOOKS_FILE}:`, error);
    }
};
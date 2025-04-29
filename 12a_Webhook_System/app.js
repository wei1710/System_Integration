import express from 'express';
import axios from 'axios';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 8080;

const WEBHOOKS_FILE = path.join(__dirname, 'webhooks.json');

app.use(express.json());

const eventTypes = ["payment.received", "payment.processed", "invoice.processing", "invoice.completed"];

const sendWebhook = async (url, payload) => {
    console.log(`[Exposee] Attempting to send webhook to ${url} for event ${payload.event_type}`);
    try {
        await axios.post(url, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        console.log(`[Exposee] Webhook sent successfully to ${url}`);
    } catch (error) {
        console.error(`[Exposee] Failed to send webhook to ${url} for event ${payload.event_type}: ${error.message}`);
    }
};

const readWebhooks = async () => {
    try {
        const data = await readFile(WEBHOOKS_FILE, 'utf-8');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.warn(`[Exposee] Could not read or parse ${WEBHOOKS_FILE}. Treating as empty. Error: ${error.message}`);
        return [];
    }
};

const writeWebhooks = async (webhooks) => {
    try {
        const data = JSON.stringify(webhooks, null, 2);
        await writeFile(WEBHOOKS_FILE, data, 'utf-8');
    } catch (error) {
        console.error(`[Exposee] Error writing ${WEBHOOKS_FILE}:`, error);
    }
};



app.post('/register', async (req, res) => {
    const { url, event_types } = req.body;

    try {
        const webhooks = await readWebhooks();

        const newWebhook = {
            url: url,
            event_types: event_types,
            registeredAt: new Date().toISOString()
        };

        webhooks.push(newWebhook);

        await writeWebhooks(webhooks);

        console.log('[Exposee] Webhook registered:', newWebhook);
        console.log('[Exposee] Current registered webhooks count:', webhooks.length);

        res.status(201).json({
            message: 'Webhook registered successfully.',
            url: newWebhook.url,
            event_types: newWebhook.event_types,
            registeredAt: newWebhook.registeredAt
        });

    } catch (error) {
        console.error('[Exposee] Failed during registration process:', error);
        res.status(500).json({ message: 'An error occurred during registration.' });
    }
});

app.get('/ping', async (req, res) => {
     try {
        const webhooks = await readWebhooks();

        const pingPayload = {
            event_type: 'ping',
            timestamp: new Date().toISOString(),
            message: 'This is a test ping from the webhook system.'
        };

        console.log(`[Exposee] Triggering ping event for ${webhooks.length} registered webhooks.`);
        webhooks.forEach(webhook => {
            sendWebhook(webhook.url, pingPayload);
        });

        res.status(200).json({ message: 'Ping event triggered for all registered webhooks.' });

    } catch (error) {
        console.error('[Exposee] Failed during ping event process:', error);
        res.status(500).json({ message: 'An error occurred during ping event.' });
    }
});

app.post('/simulate-event', async (req, res) => {
    const { event_type, data } = req.body;

    try {
        const webhooks = await readWebhooks();

        console.log(`[Exposee] Simulating event "${event_type}".`);

        webhooks.forEach(webhook => {
            if (Array.isArray(webhook.event_types) && webhook.event_types.includes(event_type)) {
                 const eventPayload = {
                    event_type: event_type,
                    timestamp: new Date().toISOString(),
                    data: data
                };
                sendWebhook(webhook.url, eventPayload);
            }
        });

        res.status(200).json({ message: `Event "${event_type}" simulated and triggered for subscribed webhooks.` });

    } catch (error) {
         console.error('[Exposee] Failed during event simulation process:', error);
         res.status(500).json({ message: 'An error occurred during event simulation.' });
    }
});

app.listen(PORT, () => {
    console.log(`Exposee Webhook System (Simplified File I/O, No Validation) listening on port ${PORT}`);
    console.log(`Available Event Types: ${eventTypes.join(', ')}`);
    console.log(`Registration Endpoint: POST /register`);
    console.log(`Ping Endpoint: GET /ping`);
    console.log(`Simulate Event Endpoint: POST /simulate-event`);
    console.log(`Webhook data stored in: ${WEBHOOKS_FILE}`);
    console.log(`*** EXTREME WARNING: This server has almost no validation and simplified error`)
});
import express from 'express';
import webhooksRouter from './routes/webhooks.js';
import eventsRouter from './routes/events.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ?? 8080;
const WEBHOOKS_FILE = path.join(__dirname, "webhooks.json");
const eventTypes = ["payment.received", "payment.processed", "invoice.processing", "invoice.completed"];

app.use(express.json());

app.use("/", webhooksRouter);
app.use("/", eventsRouter);

app.listen(PORT, () => {
    console.log("Server is running on port:", PORT);
    console.log("Event Types:", eventTypes.join(', '));
    console.log("Registration Endpoint: POST /register");
    console.log("Unregistration Endpoint: DELETE /unregister");
    console.log("Ping Endpoint: GET /ping");
    console.log("Event Endpoint: POST /event");
    console.log("Webhook data stored in:", WEBHOOKS_FILE);
});
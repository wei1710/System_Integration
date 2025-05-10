import express from 'express';
import { readWebhooks, writeWebhooks, sendWebhook } from '../services/webhookService.js';

const router = express.Router();

const validEventTypes = [
    "payment.received",
    "payment.processed",
    "invoice.processing",
    "invoice.completed"
];

const validateWebhook = async (body, isRegistration = true) => {
    const { url, event_types } = body;

    if (!url || typeof url !== 'string' || url.trim() === '') {
        return { status: 400, message: `Webhook URL is required for ${isRegistration ? 'registration' : 'unregistration'}.` };
    }

    try {
        new URL(url);
    } catch (error) {
        return { status: 400, message: 'Webhook URL is not a valid format.' };
    }

    if (isRegistration) {
        if (!Array.isArray(event_types) || event_types.length === 0) {
            return { status: 400, message: 'Event types are required for registration.' };
        }

        const areAllEventsValid = event_types.every(event => validEventTypes.includes(event));

        if (!areAllEventsValid) {
            return { status: 400, message: `Invalid event types provided. Valid types are: ${validEventTypes.join(', ')}` };
        }

        try {
            const webhooks = await readWebhooks();
            const isDuplicate = webhooks.some(
                (webhook) =>
                    webhook.url === url &&
                    Array.isArray(webhook.event_types) &&
                    Array.isArray(event_types) &&
                    webhook.event_types.length === event_types.length &&
                    webhook.event_types.every((event, index) => event === event_types[index])
            );

            if (isDuplicate) {
                return { status: 409, message: 'Webhook with the same URL and event types is already registered.' };
            }

        } catch (error) {
            console.error('Error reading webhooks during validation:', error);
            return { status: 500, message: 'An error occurred during validation.' };
        }
    } else {
        if (event_types && !Array.isArray(event_types) && event_types !== undefined) {
            return { status: 400, message: 'Event types, if provided for unregistration, must be an array.' };
        }
    }

    return undefined;
};

router.post("/register", async (req, res) => {
    const validationError = await validateWebhook(req.body, true);

    if (validationError) {
        return res.status(validationError.status).send({ message: validationError.message });
    }

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

        console.log("Webhook registered:", newWebhook);
        console.log("Current registered webhooks count:", webhooks.length);

        res.status(201).send({
            message: "Webhook registered successfully.",
            url: newWebhook.url,
            event_types: newWebhook.event_types,
            registeredAt: newWebhook.registeredAt
        });

    } catch (error) {
        console.error("Failed during registration process:", error);
        res.status(500).send({ message: "An error occurred during registration." });
    }
});


router.get("/ping", async (req, res) => {
    try {
        const webhooks = await readWebhooks();

        const pingPayload = {
            event_type: "ping",
            timestamp: new Date().toISOString(),
            message: "This is a test ping from the webhook system."
        };

        console.log(`Triggering ping event for ${webhooks.length} registered webhooks.`);
        webhooks.forEach(webhook => {
            sendWebhook(webhook.url, pingPayload);
        });

        res.status(200).send({ message: "Ping event triggered for all registered webhooks." });

    } catch (error) {
        console.error("Failed during ping event process:", error);
        res.status(500).send({ message: "An error occurred during ping event." });
    }
});

router.delete("/unregister", async (req, res) => {
    const validateError = await validateWebhook(req.body, false);
    if (validateError) {
        return res.status(validateError.status).send({ message: validateError.message });
    }

    const { url, event_types } = req.body;

    if (!url) {
        return res.status(400).send({ message: "Webhook URL is required for unregistration." });
    }

    try {
        let webhooks = await readWebhooks();
        const initWebhookCount = webhooks.length;

        const filteredWebhooks = webhooks.filter(webhook => {
            if (webhook.url === url) {
                if (event_types && Array.isArray(event_types) && event_types.length > 0) {
                    return !event_types.some(event_type => webhook.event_types.includes(event_type));
                } else {
                    return false;
                }
            }
            return true;
        });

        if (filteredWebhooks.length === initWebhookCount) {
            return res.status(404).send({ message: "No matching webhook found to unregister." });
        }

        await writeWebhooks(filteredWebhooks);

        console.log("Webhooks for URL", url, "unregistered.");
        console.log("Currently registered webhooks count:", filteredWebhooks.length);

        res.status(200).send({
            message: "Webhooks unregistered successfully.",
            url: url,
            removedCount: initWebhookCount - filteredWebhooks.length
        });

    } catch (error) {
        console.error("Failed during unregistration process:", error);
        res.status(500).send({ messsage: "An error occurred during unregistration." });
    }
});

export default router;
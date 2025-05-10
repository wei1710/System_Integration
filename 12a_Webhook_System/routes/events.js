import express from 'express';
import { readWebhooks, sendWebhook } from '../services/webhookService.js';

const router = express.Router();

router.post('/event', async (req, res) => {
    const { event_type, data } = req.body;

    try {
        const webhooks = await readWebhooks();

        console.log(`[Exposee] Event "${event_type}".`);

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

        res.status(200).send({ message: `Event "${event_type}" and triggered for subscribed webhooks.` });

    } catch (error) {
        console.error('[Exposee] Failed during event process:', error);
        res.status(500).send({ message: 'An error occurred during event.' });
    }
});

export default router;
import axios from 'axios';

const WEBHOOK_BASE_URL = 'https://wide-apples-say.loca.lt';

const WEBHOOK_RECEIVER_URL = 'https://long-ants-ring.loca.lt/webhook-receiver';

const EVENT = 'payment_received';

async function registerWebhook() {
    const payload = {
        url: WEBHOOK_RECEIVER_URL,
        event_types: [EVENT],
    };

    try {
        const response = await axios.post(`${WEBHOOK_BASE_URL}/webhooks/register`, payload, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000,
        });

        console.log(`Register Response: ${response.status} —`, response.data);
    } catch (error) {
        const errorData = error.response?.data || error.message;
        console.error(`Failed to register webhook:`, errorData);
    }
}

registerWebhook();
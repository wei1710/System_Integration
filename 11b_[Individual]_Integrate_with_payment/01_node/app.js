import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
const app = express();
const port = process.env.PORT || 8080;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const endpoint_url = process.env.ENVIRONMENT === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

app.use(express.static('public'));
app.use(express.json());

app.get('/config', (req, res) => {
  if (!client_id) {
    console.error("No client_id found");
  }
  res.send({ payment_client_id: client_id});
});

app.post('/create_order', (req, res) => {
  getAccessToken().then(token => {
    const order = {
      intent: req.body.intent.toUpperCase(),
      purchase_units: [{
        amount: { currency_code: "USD", value: "100.00" }
      }]
    };
    return fetch(`${endpoint_url}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(order)
    });
  })
    .then(r => r.json())
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error creating order" });
    });
});

app.post('/complete_order', (req, res) => {
  getAccessToken().then(token => {
    return fetch(`${endpoint_url}/v2/checkout/orders/${req.body.order_id}/${req.body.intent}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  })
    .then(r => r.json())
    .then(data => res.json(data))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: "Error completing order" });
    });
});

function getAccessToken() {
  const auth = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
  return fetch(`${endpoint_url}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${auth}`
    },
    body: 'grant_type=client_credentials'
  })
    .then(res => res.json())
    .then(data => data.access_token);
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
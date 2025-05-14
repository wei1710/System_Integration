import express from 'express';
const app = express();
app.use(express.json());

app.post("/webhook-receiver", (req, res) => {
  console.log("Webhook received:", req.body);
  res.sendStatus(200);
});

const PORT = process.env.PORT || 9090;
app.listen(PORT, () => console.log("Server is running on port", PORT));
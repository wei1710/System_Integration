import express from 'express';

const app = express();

app.use(express.static("public"));

app.get("/synchronizetime", (req, res) => {
  res.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache"
  });


  setInterval(() => sendTimeClient(res), 1000);
});

function sendTimeClient(res) {
  const time = new Date().toISOString();
  res.write(`data: ${time} \n\n`);
}


const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => console.log("Server is running on port", PORT));

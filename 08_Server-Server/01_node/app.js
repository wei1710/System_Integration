import express from 'express';

const app = express();

app.get("/expressData", (req, res) => {
  res.send({ data: "This is the data from Express" });
});

app.get("/requestFastAPIData", async (req, res) => {
  const response = await fetch("http://127.0.0.1:8000/fastapiData");
  const result = await response.json();

  res.send({ data: result.data })
});

app.get("/names/:name", (req, res) => {
  console.log(req.params.name);
  res.send({ data: `Your name is ${req.params.name}` });
});

app.get("/time/now", (req, res) => {
  let current_time = new Date(Date.now()).toLocaleString();
  console.log(current_time);
  res.send({ data: `The current time is ${current_time}` })
});

const PORT = 8080;
app.listen(PORT, () => console.log("Server stated on port", PORT));

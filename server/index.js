import express from "express";

const app = express();

app.use(express.json())

app.get("/", (req, res) => {
  res.json({status: "You made it"})
})

app.get("/health", (req, res) => {
  res.json({ status: "still alive" });
})

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
})
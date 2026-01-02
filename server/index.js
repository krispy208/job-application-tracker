import express from "express";

let applications = [];
let nextId = 1;

const app = express();

app.use(express.json())

app.get("/", (req, res) => {
  res.json({status: "You made it"})
})

app.get("/health", (req, res) => {
  res.json({ status: "still alive" });
})

app.get("/applications", (req, res) => {
  res.json(applications)
})

app.post("/applications", (req, res) => {
  const { company, role, status, link, notes } = req.body;
  if (!company || !role) {
    return res.status(400).json({error: "Company and role are required"})
  }

  const appEntry = {
    id: nextId++,
    company,
    role,
    status: status ?? "applied",
    link: link ?? "",
    notes: notes ?? "",
    createdAt: new Date().toISOString()
  };
  applications.push(appEntry);
  res.status(201).json(appEntry);
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
})
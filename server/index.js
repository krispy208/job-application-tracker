import express from "express";

let applications = [];
let nextId = 1;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "You made it" })
});

app.get("/health", (req, res) => {
  res.json({ status: "still alive" });
});

app.get("/applications", (req, res) => {
  res.json(applications)
});

app.post("/applications", (req, res) => {
  const { company, role, status, link, notes } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "Company and role are required" })
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
});

app.put("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const application = applications.find(app => app.id === id);
  if (!application) {
    return res.status(404).json({ error: "Application not found" });
  }
  const { company, role, status, link, notes } = req.body;
  application.company = company ?? application.company;
  application.role = role ?? application.role;
  application.status = status ?? application.status;
  application.link = link ?? application.link;
  application.notes = notes ?? application.notes
  res.json(application);
});

app.delete("/applications/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = applications.findIndex(app => app.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Application not found" });
  }
  applications.splice(index, 1);
  res.status(204).send()
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
})
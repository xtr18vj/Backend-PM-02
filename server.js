const app = require("./app");
const db = require("./src/config/db");
const { sseHandler } = require("./src/realtime/sse");

app.get("/db-test", (req, res) => {
  db.get("SELECT datetime('now') AS now", (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      success: true,
      time: row.now,
    });
  });
});

app.get("/events", sseHandler);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

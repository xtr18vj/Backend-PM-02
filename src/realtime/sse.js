const clients = new Set();

function sseHandler(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write("event: connected\ndata: {}\n\n");
  clients.add(res);

  const keepAlive = setInterval(() => {
    if (clients.has(res)) {
      res.write(": keep-alive\n\n");
    }
  }, 30000);

  req.on("close", () => {
    clearInterval(keepAlive);
    clients.delete(res);
  });
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients.forEach((res) => {
    res.write(payload);
  });
}

module.exports = { sseHandler, broadcast };

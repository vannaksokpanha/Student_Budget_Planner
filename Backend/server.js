const http = require("http");
const userRoutes = require("./Routes/userRoutes");

const PORT = 5000;

const server = http.createServer((req, res) => {
  const handled = userRoutes(req, res);

  if (handled === false) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

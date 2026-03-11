const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store io globally for use in API routes
  global.io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-inventory", (inventoryId) => {
      socket.join(`inventory:${inventoryId}`);
      console.log(`Socket ${socket.id} joined inventory:${inventoryId}`);
    });

    socket.on("leave-inventory", (inventoryId) => {
      socket.leave(`inventory:${inventoryId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
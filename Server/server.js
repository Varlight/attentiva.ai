import { WebSocketServer } from "ws";
import http from 'http';
import { networkInterfaces } from 'os';

const server = http.createServer();

const wss = new WebSocketServer({
  server,
  perMessageDeflate: false,
  verifyClient: ({ origin, req, secure }, cb) => {
    cb(true);
  }
});

const clients = new Set();

wss.on("connection", (ws, req) => {
  clients.add(ws);
  console.log(`New client connected from ${req.socket.remoteAddress}. Total clients: ${clients.size}`);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message type:", data.type);
      
      // Broadcast the message to all other connected clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error("Error handling message:", err);
    }
  });

  ws.send(JSON.stringify({ type: "connection", status: "success" }));

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clients.delete(ws);
  });
});

server.listen(5000, '0.0.0.0', () => {
  const interfaces = networkInterfaces();
  console.log('WebSocket server running on port 5000');
  console.log('\nAvailable on:');
  
  Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((details) => {
      if (details.family === 'IPv4') {
        console.log(`  ws://${details.address}:5000`);
      }
    });
  });
});

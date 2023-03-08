// socket.js
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const socketsByStore = {};

export function createSocketConnection(shopDomain) {
  if (socketsByStore[shopDomain]) {
    return socketsByStore[shopDomain];
  }

  const socket = io.of(`http://localhost:3000/${shopDomain}`);

  io.on("connection", (socket) => {
    const shopDomain = socket.handshake.query.shop;
    console.log(`Socket connected for shop ${shopDomain}`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected for shop ${shopDomain}`);
    });
  });

  socket.on("connect", () => {
    console.log(`Connected to socket for shop ${shopDomain}`);
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected from socket for shop ${shopDomain}`);
  });

  socketsByStore[shopDomain] = socket;

  return socket;
}

export function sendNotification(shopDomain, message) {
  const socket = socketsByStore[shopDomain];

  if (socket) {
    socket.emit("notification", { message });
    console.log(`Sent notification to shop ${shopDomain}`);
  } else {
    console.log(`Could not find socket for shop ${shopDomain}`);
  }
}

httpServer.listen(3000, () => {
  console.log("Socket.IO server listening on port 3000");
});

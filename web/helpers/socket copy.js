import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// io.on("connection", (socket) => {
//   console.log("A user connected");
//   io.emit("notification", { message: "New purchase added" });
  
//   socket.on("message", (msg) => {
//     console.log(`Message received: ${msg}`);
//   });

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

httpServer.listen(3000, () => {
  console.log("Socket.IO server listening on port 3000");
});

export default io;

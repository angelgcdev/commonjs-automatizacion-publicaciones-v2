const { Server } = require("socket.io");

let io; // Para almacenar la instancia de socket.io
const userSockets = {}; //Relacion entre UserId y socket.id

function initSocket(httpServer, corsOptions) {
  io = new Server(httpServer, { cors: corsOptions });

  io.on("connection", (socket) => {
    console.log("Nuevo cliente conectado:", socket.id);

    socket.on("register", (userId) => {
      userSockets[userId] = socket.id;
      console.log(`Usuario ${userId} registrado con socket ID ${socket.id}`);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
      for (const userId in userSockets) {
        if (userSockets[userId] === socket.id) {
          delete userSockets[userId];
          break;
        }
      }
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error("Socket.io no ha sido inicializado.");
  }
  return io;
}

module.exports = { initSocket, getIo, userSockets };

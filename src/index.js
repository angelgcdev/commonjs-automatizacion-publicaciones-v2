// src/index.js
const express = require("express");
const { PORT } = require("./config.js");
const { router } = require("./routes/users.routes.js");
const { adminRouter } = require("./routes/admin.routes.js");
const morgan = require("morgan");
const path = require("path");
const { createServer } = require("http");
const { initSocket } = require("./socket.js");

const app = express();
const httpServer = createServer(app); //Crea un servidor HTTP

initSocket(httpServer, {
  origin: [`http://localhost:${PORT}`, "https://post.posgradoupea.edu.bo"],
  methods: ["GET", "POST"],
  credentials: true,
});

app.use(morgan("dev")); // Logger
app.use(express.json()); // Para parsear JSON
app.use(express.urlencoded({ extended: true })); //para parsear URL-encoded
app.use(express.static(path.join(__dirname, "../public"))); // Servir archivos estaticos
app.use(router); //Usar las rutas definidas para usuarios
app.use(adminRouter); // Usar las rutas definidas para administradores

// Iniciar el servidor
httpServer.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}/login.html`;
  console.log(`Server running at ${baseUrl}`);
});

// src/middlewares/users.middlewares.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // Obtener el token del encabezado 'Authorization'
  const token = req.headers["authorization"];

  //Verificar si no hay token en el encabezado
  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  //El token normalmente viene como 'Bearer <token>', por lo que eliminamos "Bearer"
  const tokenWithoutBearer = token.split(" ")[1];

  //Verificamos la validez del token con la clave secreta (JWT_SECRET)
  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    //Si el token es válido, guardamos el id del usuario decodificado en req.userId
    req.userId = decoded.id;

    //Pasamos al siguiente middleware o ruta
    next();
  });
};

export { verifyToken };

// src/controllers/users.controllers.js
const { getIo, userSockets } = require("../socket.js");

const { pool } = require("../db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  automatizarFacebook,
  cancelAutomation,
} = require("../automation/facebookAutomation.js");
const { postImg } = require("../automation/postImg.js");

/************VARIABLES***********/
const saltRounds = 10;
let isCanceled = false;

//Emitir funcion al usuario
const emitirMensajeAUsuario = (userId, mensaje, esError = false) => {
  const io = getIo();

  if (userSockets[userId]) {
    const tipoMensaje = esError ? "automation:error" : "automation:update";
    io.to(userSockets[userId]).emit(tipoMensaje, mensaje);
    console.log(
      `Mensaje ${esError ? "de error" : "enviado"} enviado a usuario ${userId}`
    );
  } else {
    console.log("Usuario no encontrado");
  }
};

const infoUser = async (req, res) => {
  const { id_usuario } = req.params;

  //Verificacion del id_usuario

  if (!id_usuario || isNaN(id_usuario)) {
    return res
      .status(400)
      .json({ error: "El ID de usuario es inválido o no proporcionado" });
  }

  try {
    const { rows } = await pool.query(
      " SELECT * FROM usuarios WHERE id_usuario=$1",
      [id_usuario]
    );

    //Comprobar si se encontro un usuario con ese id_usuario
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    //Si se encuentra al usuario, devolver los datos
    res.status(200).json(rows);
  } catch (error) {
    //Manejo de errores de la base de datos o cualquier otro tipo de error
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

const getUsers = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM usuarios;");
  res.json(rows);
};

const cargos = async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM cargos;");
  return res.status(200).json(rows);
};

const createUser = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      id_cargo,
      oficina,
      email,
      password,
      is_admin = false,
    } = req.body;

    //Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      "INSERT INTO usuarios (nombres, apellidos, id_cargo, oficina, email, password, is_admin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombres, apellidos, id_cargo, oficina, email, hashedPassword, is_admin]
    );
    return res.json(rows[0]);
  } catch (error) {
    console.log(error);

    if (error?.code === "23505") {
      return res
        .status(409)
        .json({ message: "El correo ya ha sido registrado." }); // estado 409 indica conflicto entre datos
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //Buscar el usuario por email
  const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
    email,
  ]);

  if (rows.length === 0) {
    return res.status(401).json({ message: "No existe la cuenta" });
  }

  const user = rows[0];

  //Comparar la contraseña
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Contraseña invalida" });
  }

  //Crear un token JWT
  const token = jwt.sign(
    { id: user.id_usuario, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    id_usuario: user.id_usuario,
    email: user.email,
    is_admin: user.is_admin,
  });
};

const addPost = async (req, res) => {
  try {
    const {
      id_usuario,
      email,
      password,
      url,
      mensaje,
      numero_de_posts,
      intervalo_tiempo,
    } = req.body;

    const url_img = await postImg(url);
    console.log("URL de imagen: ", url_img);

    const { rows } = await pool.query(
      "INSERT INTO publicaciones (id_usuario, email, password, url, url_img, mensaje, numero_de_posts, intervalo_tiempo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [
        id_usuario,
        email,
        password,
        url,
        url_img,
        mensaje,
        numero_de_posts,
        intervalo_tiempo,
      ]
    );
    return res.status(200).json({ message: "Publicación añadida con éxito." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Se produjo un error al añadir la publicación." });
  }
};

const updatePostStatus = async (req, res) => {
  const { id_publicacion } = req.params;
  const { estado } = req.body;

  try {
    const { rows } = await pool.query(
      "UPDATE publicaciones SET activo = $1 WHERE id_publicacion=$2 RETURNING *",
      [estado, id_publicacion]
    );

    return res
      .status(200)
      .json({ message: "Estado de publicación actualizada con éxito." });
  } catch (error) {
    console.error(
      "Error durante la actualización del estado de la publicación:",
      error
    );

    return res.status(500).json({
      message: "Se produjo un error al actualizar el estado de la publicación.",
    });
  }
};

const getPosts = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM publicaciones WHERE id_usuario=$1;",
      [id_usuario]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.log("Error al obtener la lista de usuarios:", error);

    return res.status(500).json({
      message: "Se produjo un error al obtener la lista de usuarios.",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id_publicacion } = req.params;
    const { rowCount } = await pool.query(
      "DELETE FROM publicaciones WHERE id_publicacion = $1 RETURNING *",
      [id_publicacion]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    res
      .status(200)
      .json({ message: "La publicación ha sido eliminado con éxito." });
  } catch (error) {
    console.error("Error durante la eliminacion de la publicación:", error);

    res
      .status(500)
      .json({ message: "Se produjo un error al eliminar la publicación." });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id_publicacion } = req.params;
    const { email, password, url, mensaje, numero_de_posts, intervalo_tiempo } =
      req.body;

    const url_img = await postImg(url);
    console.log("URL de imagen: ", url_img);

    const { rows } = await pool.query(
      "UPDATE publicaciones SET email = $1, password = $2, url = $3, url_img = $4, mensaje = $5, numero_de_posts = $6, intervalo_tiempo = $7 WHERE id_publicacion= $8 RETURNING *",
      [
        email,
        password,
        url,
        url_img,
        mensaje,
        numero_de_posts,
        intervalo_tiempo,
        id_publicacion,
      ]
    );

    return res
      .status(200)
      .json({ message: "Publicación actualizada con éxito." });
  } catch (error) {
    console.error("Error durante la actualización de la publicación:", error);

    return res
      .status(500)
      .json({ message: "Se produjo un error al actualizar la publicación." });
  }
};

const sharePosts = async (req, res) => {
  try {
    //Reiniciar el estado de cancelacion al iniciar la solicitud
    isCanceled = false;

    const { id_usuario, activo } = req.params;

    const { rows } = await pool.query(
      "SELECT * FROM publicaciones WHERE id_usuario=$1 AND activo=$2;",
      [id_usuario, activo]
    );

    for (const post of rows) {
      if (isCanceled) {
        res.status(200).json({ message: "Publicaciones canceladas" });
        return;
      }
      try {
        await automatizarFacebook(post, id_usuario);
      } catch (error) {
        console.log(
          `Error al automatizar publicaciones de: ${post.email}`,
          error
        );
      }
    }

    emitirMensajeAUsuario(
      id_usuario,
      "Se terminó de compartir las publicaciones..."
    );

    return res.status(200).json({
      message: "Automatización de posts completada con éxito.",
    });
  } catch (error) {
    console.log("Error durante sharePosts:", error);
    return res.status(500).json({
      message: "Se produjo un error durante la automatización de posts.",
    });
  }
};

const postsReport = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      `
      SELECT * FROM reportes 
      WHERE id_usuario=$1
      ORDER BY fecha_publicacion DESC;
      `,
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "publicaciones no encontradas" });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el reporte de publicaciones.");
    return res.status(500).json({
      message: "Se produjo un error al obtener el reporte de publicaciones.",
    });
  }
};

const totalP = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM reportes WHERE id_usuario= $1;",
      [id_usuario]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "No se pudo obtener el resultado." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el total.");
    return res.status(500).json({
      message: "Se produjo un error al obtener el total.",
    });
  }
};

const postsReportDay = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      "SELECT DATE_TRUNC('day', fecha_publicacion) AS dia, COUNT(*) AS total_publicaciones FROM reportes WHERE id_usuario = $1 GROUP BY DATE_TRUNC('day', fecha_publicacion) ORDER BY dia DESC;",
      [id_usuario]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "reporte diario no encontrado" });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el reporte diario de publicaciones.");
    return res.status(500).json({
      message:
        "Se produjo un error al obtener el reporte diario de publicaciones.",
    });
  }
};

const postsReportCurrentDay = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      "SELECT DATE_TRUNC('day', fecha_publicacion) AS dia, COUNT(*) AS total_publicaciones FROM reportes WHERE id_usuario = $1 AND DATE_TRUNC('day', fecha_publicacion) = CURRENT_DATE GROUP BY DATE_TRUNC('day', fecha_publicacion) ORDER BY dia DESC;",
      [id_usuario]
    );

    //Si no hay publicaciones para hoy, devolvemos un conteo de 0
    if (rows.length === 0) {
      return res.status(200).json({
        dia: new Date().toISOString().split("T")[0],
        total_publicaciones: 0,
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el total de publicaciones diarias.");
    return res.status(500).json({
      message:
        "Se produjo un error al obtener el total de publicaciones diarias.",
    });
  }
};

const detailPost = async (req, res) => {
  try {
    const { id_usuario, email } = req.params;
    const { rows } = await pool.query(
      `
      SELECT * FROM reportes 
      WHERE id_usuario=$1 AND email=$2
      ORDER BY fecha_publicacion DESC;
      `,
      [id_usuario, email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Publicaciones no encontradas" });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el reporte de publicaciones.");
    return res.status(500).json({
      message: "Se produjo un error al obtener el reporte de publicaciones",
    });
  }
};

const totalD = async (req, res) => {
  try {
    const { id_usuario, email } = req.params;
    const { rows } = await pool.query(
      "SELECT COUNT(*) FROM reportes WHERE id_usuario= $1 AND email= $2;",
      [id_usuario, email]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "No se pudo obtener el resultado." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el total.");
    return res.status(500).json({
      message: "Se produjo un error al obtener el total.",
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM reportes RETURNING *");

    return res.status(200).json({ message: "Reporte eliminado con éxito." });
  } catch (error) {
    console.error("Error durante la eliminacion del reporte:", error);
    return res
      .status(500)
      .json({ message: "Se produjo un error al eliminar el Reporte." });
  }
};

const cancelPosts = async (req, res) => {
  try {
    cancelAutomation();

    isCanceled = true;
    console.log("Publicaciones canceladas. Estado:", isCanceled);
    return res
      .status(200)
      .json({ message: "Publicaciones canceladas exitosamente." });
  } catch (error) {
    console.log("Error al cancelar las publicaciones.", error);
    return res
      .status(500)
      .json({ message: "Error al cancelar las publicaciones." });
  }
};

module.exports = {
  infoUser,
  getUsers,
  cargos,
  createUser,
  loginUser,
  addPost,
  updatePostStatus,
  getPosts,
  deletePost,
  updatePost,
  sharePosts,
  postsReport,
  postsReportDay,
  postsReportCurrentDay,
  totalP,
  detailPost,
  totalD,
  deleteReport,
  cancelPosts,
};

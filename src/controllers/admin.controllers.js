// src/controllers/users.controllers.js

const { pool } = require("../db.js");
const { postInformation } = require("../automation/postInformation.js");

const totalCG = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT COUNT(*) as total_compartidas_global FROM reportes;"
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ message: "No se pudo obtener el resultado." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el total.");
    return res.status(500).json({
      message: "Se produjo un error al obtener el total.",
    });
  }
};

const sharesByDay = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DATE_TRUNC('day', fecha_publicacion) AS dia, COUNT(*) AS total_publicaciones 
      FROM reportes 
      GROUP BY DATE_TRUNC('day', fecha_publicacion) 
      ORDER BY dia DESC;`);

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

const adminPostsReportCurrentDay = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT DATE_TRUNC('day', fecha_publicacion) AS dia, COUNT(*) AS total_publicaciones FROM reportes WHERE DATE_TRUNC('day', fecha_publicacion) = CURRENT_DATE GROUP BY DATE_TRUNC('day', fecha_publicacion) ORDER BY dia DESC;"
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

const facebookAccounts = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT email FROM reportes;");

    if (rows === 0) {
      return res.status(400).json({ message: "cuentas no encontradas." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener el reporte de publicaciones.");
    return res.status(500).json({
      message: "Se produjo un error al obtener las cuentas de facebook",
    });
  }
};

const appUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
    SELECT
      u.id_usuario,
	    u.nombres,
 	    u.apellidos,
 	    u.oficina,
 	    u.email,
 	    c.nombre AS cargo,
      COALESCE(COUNT(r.id_reporte), 0) AS total_compartidas
    FROM
	    usuarios u
    JOIN
	    cargos c ON u.id_cargo = c.id_cargo
    JOIN
	    reportes r ON u.id_usuario = r.id_usuario
    GROUP BY
	    u.id_usuario, c.nombre;
      `);

    if (rows === 0) {
      return res.status(400).json({ message: "usuarios no encontrados." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener los usuarios de la aplicación.");
    return res.status(500).json({
      message: "Se produjo un error al obtener los usuarios de la aplicación.",
    });
  }
};

const postsReport = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT * FROM reportes
      ORDER BY fecha_publicacion DESC;
      `);

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

const postsInfo = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT url FROM reportes;");

    // Maneja el caso de no encontrar URLs
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron ls URLs de las  publicaciones." });
    }

    const publicacionesInfo = [];

    for (const row of rows) {
      try {
        const info = await postInformation(row.url);
        publicacionesInfo.push(info);
      } catch (error) {
        console.log(
          `Error al obtener información para la URL: ${row.url}`,
          error
        );
      }
    }

    return res.status(200).json(publicacionesInfo);
  } catch (error) {
    console.error(
      "Error al obtener las URLs de las imagenes de las publiciones",
      error
    );
    return res.status(500).json({
      message: "Se produjo un error al obtener las URLs de la publicaciones.",
    });
  }
};

const infoUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE id_usuario=$1;",
      [id_usuario]
    );

    if (rows === 0) {
      return res.status(400).json({ message: "usuario no encontrado." });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener la información del usuario.");
    return res.status(500).json({
      message: "Se produjo un error al obtener la información del usuario.",
    });
  }
};

module.exports = {
  totalCG,
  sharesByDay,
  adminPostsReportCurrentDay,
  facebookAccounts,
  appUsers,
  postsReport,
  postsInfo,
  infoUsuario,
};

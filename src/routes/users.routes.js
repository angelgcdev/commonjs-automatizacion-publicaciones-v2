// src/routes/users.routes.js
const { Router } = require("express");
const {
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
  deleteReport,
  detailPost,
  totalD,
  totalP,
  cancelPosts,
  postsReportCurrentDay,
} = require("../controllers/users.controllers.js");
// import { verifyToken } from "../middlewares/users.middlewares.js";

const router = Router();

router.get("/users/infoUser/:id_usuario", infoUser);

router.get("/users", getUsers);

router.get("/users/cargos", cargos);

router.post("/users/createUser", createUser);

router.post("/login", loginUser);

router.post("/addPost", addPost);

router.put("/users/updatePostStatus/:id_publicacion", updatePostStatus);

router.get("/getPosts/:id_usuario", getPosts);

router.delete("/deletePost/:id_publicacion", deletePost);

router.put("/updatePost/:id_publicacion", updatePost);

router.post("/sharePosts/:id_usuario/:activo", sharePosts);

router.get("/postsReport/:id_usuario", postsReport);

router.get("/totalP/:id_usuario/", totalP);

router.get("/postsReportDay/:id_usuario", postsReportDay);

router.get("/postsReportCurrentDay/:id_usuario", postsReportCurrentDay);

router.get("/detailPost/:id_usuario/:email", detailPost);

router.get("/totalD/:id_usuario/:email", totalD);

router.delete("/deleteReport", deleteReport);

router.post("/cancelPosts", cancelPosts);

module.exports = { router };

// public/js/main-admin.js

//Importaciones de utilidades
import { logoutUser } from "./utils/logoutUser.js";
import { requestData } from "./utils/requestData.js";
import { showLoading } from "./utils/showLoading.js";
import { hideLoading } from "./utils/hideLoading.js";
import { showNotification } from "./utils/showNotification.js";

//Variables globales
const reportContent = document.querySelector("#reportContent");
const titleReport = document.querySelector("#title_report");

// Datos del usuario
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userEmail = localStorage.getItem("userEmail");
const userAdmin = localStorage.getItem("userAdmin");
let posts = [];

// Elementos del DOM

const searchInput = document.getElementById("search__posts-input");

const content = document.getElementById("content");
const resumenBtn = document.getElementById("resumenBtn");
const publicacionesBtn = document.getElementById("publicacionesBtn");
const registroBtn = document.getElementById("registroBtn");

/*** Sección 1: Validación de usuario ***/
document.addEventListener("DOMContentLoaded", () => {
  if (!token || userAdmin === "false") {
    logoutUser();
  }
});

/*** Seccción 2: Funciones de renderizado ***/

// Renderizar el resumen
const renderResumen = async () => {
  //Ocultar el buscador
  searchInput.classList.add("hidden");

  const totalCG = await requestData("/admin/totalCG");
  const sharesByDay = await requestData("/admin/sharesByDay");
  const facebookAccounts = await requestData("/admin/facebookAccounts");
  const appUsers = await requestData("/admin/appUsers");
  console.log(appUsers);

  content.innerHTML = `
        <div class="table__container">
          <h2 class="informe__card-title">Usuarios de la aplicación</h2>
            <table class="informe__table">
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Cargo</th>
                  <th>Oficina</th>
                  <th>Email</th>
                  <th>Total Compartidas</th>
                </tr>
              </thead>

              <tbody id="app-users-table">
              ${appUsers
                .map(
                  (post) => `
                <tr>
                  <td>${post.nombres}</td>
                  <td>${post.apellidos}</td>
                  <td>${post.cargo}</td>
                  <td>${post.oficina}</td>
                  <td>
                    <a href="${post.email}" target="_blank">
                      ${post.email}
                    </a>
                  </td>
                  <td>
                    ${post.total_compartidas}
                    <span class="button-span"></span>
                  </td>
                </tr>
                `
                )
                .join("")}
              </tbody>
            </table>
          </div>

        <div class="informe__grid">
            <div class="informe__card">
                <h2 class="informe__card-title">Total de Compartidas</h2>
                <p class="informe__big-number">${
                  totalCG.total_compartidas_global
                }</p>
            </div>

            <div class="informe__card">
                <h2 class="informe__card-title">Compartidas por Día</h2>
                <ul class="informe__list">
                    ${sharesByDay
                      .map(
                        (day) => `
                        <li class="informe__item">
                        ${new Date(day.dia).toLocaleDateString(
                          "es-ES"
                        )}: <span>${day.total_publicaciones}</span>
                        </li>
                        `
                      )
                      .join("")}
                </ul>
            </div>

            <div class="informe__card">
                <h2 class="informe__card-title">Cuentas de Facebook</h2>
                <ul class="informe__list">
                    ${facebookAccounts
                      .map(
                        (account) =>
                          `<li class="informe__item">${account.email}</li>`
                      )
                      .join("")}
                </ul>
            </div>
        </div>
    `;

  //Agregar botones a las filas de la tabla
  const tableRows = document.querySelectorAll("#app-users-table .button-span");
  let count = 0;
  tableRows.forEach((cell) => {
    const button = createButtonDetail(appUsers[count].id_usuario);
    count++;
    cell.appendChild(button);
  });
};

//Renderizar publicaciones
const renderPublicaciones = async (searchTerm = "") => {
  //Mostrar el buscador
  searchInput.classList.remove("hidden");

  try {
    //Obtener las publicaciones desde localStorage
    const posts = localStorage.getItem("posts_V1");
    if (!posts) {
      content.innerHTML = "<p>No hay publicaciones disponibles.</p>";
      return;
    }

    let parsedPosts = JSON.parse(posts);

    //Filtrar publicaciones por el término de búsqueda
    const filteredPosts = parsedPosts.filter((post) =>
      post.tituloPost.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Si no hay publicaciones que coincidan, mostrar un mensaje
    if (filteredPosts.length === 0) {
      content.innerHTML = "<p>No se encontraron publicaciones.</p>";
      return;
    }

    content.innerHTML = `
    <!-- Buscador de publicaciones -->
        <div class="informe__grid">
            ${filteredPosts
              .map(
                (info) => `
                <div class="informe__card informe__post">
                    <a href="${info.url}" target="_blank">
                      <img src="${info.imageURL}" alt="Post image" class="informe__post-image">
                    </a>

                    <div class="informe__post-content">
                        <p class="informe__post-title">${info.tituloPost}</p>
                        <div class="informe__post-stats">
                            
                            <div class="informe__post-details">
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                              >
                                <path
                                  d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3">
                                </path>
                              </svg>
                              ${info.totalLikes}
                            </div>

                            <div class="informe__post-details">
                              <svg 
                              xmlns="http://www.w3.org/2000/svg" width="24" 
                              height="24" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor"
                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            >
                              <circle cx="18" cy="5" r="3"></circle>
                              <circle cx="6" cy="12" r="3"></circle>
                              <circle cx="18" cy="19" r="3"></circle>
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                              ${info.totalShares}
                            </div>

                        </div>
                    </div>
                </div>
            `
              )
              .join("")}
        </div>
    `;
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);
  }
};

//Renderizar registro
const renderRegistro = async () => {
  //Mostrar el buscador
  searchInput.classList.add("hidden");

  const reports = await requestData(`/admin/postsReport`);

  content.innerHTML = `
        <table class="informe__table">
            <thead>
                <tr>
                    <th>Correo de Facebook</th>
                    <th>Mensaje del Post</th>
                    <th>URL del Post</th>
                    <th>Nombre del Grupo</th>
                    <th>Fecha de Publicación</th>
                </tr>
            </thead>
            <tbody>
                ${reports
                  .map(
                    (post) => `
                    <tr>
                        <td>${post.email}</td>
                        <td>${post.mensaje}</td>
                        <td><a href="${
                          post.url
                        }" target="_blank">Ver publicación</a></td>
                        <td>${post.nombre_grupo}</td>
                        <td>${new Date(
                          post.fecha_publicacion
                        ).toLocaleString()}</td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
};

//Función para abrir el modal del reporte
const openReportModal = async (id_usuario) => {
  try {
    const reports = await requestData(`/postsReport/${id_usuario}`);

    const total_p = await requestData(`/totalP/${id_usuario}`);

    const reports_day = await requestData(`/postsReportDay/${id_usuario}`);

    const infoUsuario = await requestData(`/admin/infoUsuario/${id_usuario}`);

    console.log(infoUsuario);

    if (!(reports && total_p && reports_day)) {
      showNotificationn("El reporte esta vacio");
      return;
    }

    //Limpiar el contenido previo
    reportContent.innerHTML = "";

    //Titulo del reporte
    titleReport.textContent = "Historial de publicaciones";

    reportContent.innerHTML = `

      <div class="container-title__detail">
        <p class="text-detail textEmail-detail">
          ${infoUsuario[0].nombres} ${infoUsuario[0].apellidos}
        </p>
      </div>

      <div class="container-title__detail container-title__total">
        <p class="text-detail">Total publicaciones: ${total_p[0].count}</p>
      </div>

      <div class="container-title__detail">
      <p class="text-detail">Publicaciones por día</p>
      </div>
    `;

    //Crear la tabla de publicaciones diarias
    const tableD = document.createElement("table");
    tableD.classList.add("report-post__table");

    tableD.innerHTML = `
      <thead>
        <tr>
          <th>Día</th>
          <th>Total Publicaciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbodyD = tableD.querySelector("tbody");

    //Agregar las filas de datos
    reports_day.forEach((reportDay) => {
      const rowD = document.createElement("tr");
      rowD.innerHTML = `
        <td class="report-post__text">
          ${new Date(reportDay.dia).toLocaleDateString("es-ES")}
        </td>
        <td class="report-post__text">
          ${reportDay.total_publicaciones}
        </td>
      `;

      tbodyD.appendChild(rowD);
    });

    //Insertar la tabla en el contenido del modal
    reportContent.appendChild(tableD);

    //Crear la tabla y su cabecera
    const table = document.createElement("table");
    table.classList.add("report-post__table");

    table.innerHTML = `
      <thead>
        <tr>
          <th>Correo de la Cuenta</th>
          <th>Mensaje del Post</th>
          <th>URL del Post</th>
          <th>Nombre del Grupo</th>
          <th>Fecha de Publicación</th>
        </tr>
      </thead>
      <tbody></tbody>
      `;

    const tbody = table.querySelector("tbody");

    //Agregar las filas de datos
    reports.forEach((post) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td class="report-post__text">
            ${post.email}
          </td>
          <td class="report-post__text">
            ${post.mensaje}
          </td>
          <td class="report-post__text">
            <a href="${post.url}" target="_blank">Ver publicación</a>
          </td>
          <td class="report-post__text">
            ${post.nombre_grupo}
          </td>
          <td class="report-post__text">
            ${new Date(post.fecha_publicacion).toLocaleString()}
          </td>
        `;

      tbody.appendChild(row);
    });

    //Insertar la tabla en el contenido del modal
    reportContent.appendChild(table);

    document.querySelector("#reportModal").style.display = "block";
  } catch (error) {
    showNotification("Error al cargar el reporte:", false);
  }
};

/*** Sección 3: Utilidades ***/

//Funcion para cerrar el modal del reporte
const closeReportModal = () => {
  document.querySelector("#reportModal").style.display = "none";
};

//Funcion para crear boton detalle
const createButtonDetail = (id_usuario) => {
  const buttonDetail = document.createElement("button");
  buttonDetail.classList.add("button--detail");

  const iconoDetail = document.createElement("img");
  iconoDetail.src = "../assets/icons/data_thresholding.svg";
  iconoDetail.classList.add("icon__button");

  buttonDetail.appendChild(iconoDetail);

  buttonDetail.addEventListener("click", () => openReportModal(id_usuario));

  return buttonDetail;
};

// Función para establecer el botón activo
function setActiveButton(activeButton) {
  const buttons = [resumenBtn, publicacionesBtn, registroBtn];
  buttons.forEach((btn) => {
    btn.classList.remove("informe__button--active");
  });
  activeButton.classList.add("informe__button--active");
}

//Actualizar información de publicaciones
const infoPublicaciones = async () => {
  posts = await requestData("/admin/postsInfo");

  //Limpiamos el localStorage
  localStorage.removeItem("posts_V1");

  //Guardamos los datos de las publicaciones en localStorage
  localStorage.setItem("posts_V1", JSON.stringify(posts));

  return posts;
};

/*** Sección 4: Event Listeners ***/

//Se dispara cuando se hace click en el boton 'X' del reportModal
document
  .querySelector("#closeReportModal")
  .addEventListener("click", closeReportModal);

//Cerrar el modal si se hace click fuera de el
window.addEventListener("click", (event) => {
  if (event.target === document.querySelector("#reportModal")) {
    closeReportModal();
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim();
  console.log(searchTerm);

  renderPublicaciones(searchTerm);
});

resumenBtn.addEventListener("click", () => {
  setActiveButton(resumenBtn);
  renderResumen();
});

publicacionesBtn.addEventListener("click", () => {
  setActiveButton(publicacionesBtn);
  renderPublicaciones();
});

registroBtn.addEventListener("click", () => {
  setActiveButton(registroBtn);
  renderRegistro();
});

document.querySelector("#buttonUpdate").addEventListener("click", async () => {
  const loadingContainer = showLoading("Cargando...");

  await infoPublicaciones();

  hideLoading(loadingContainer);
});

// Inicializar la página con el resumen
renderResumen();

import { showNotification } from "./utils/showNotification.js";
import { togglePasswordVisibility } from "./utils/togglePasswordVisibility.js";
import { requestData } from "./utils/requestData.js";

// public/js/register.js

//Obtener cargos
const ObtenerCargos = async () => {
  try {
    const cargos = await requestData("/users/cargos");

    const cargoSelect = document.getElementById("registerCargo");

    cargos.forEach((cargo) => {
      const option = document.createElement("option");
      option.classList.add("form__option");
      option.value = cargo.id_cargo;
      option.textContent = cargo.nombre;
      cargoSelect.appendChild(option);
    });
  } catch (error) {}
};

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombres = document.getElementById("registerNames").value.trim();
    const apellidos = document.getElementById("registerLastNames").value.trim();
    const id_cargo = document.getElementById("registerCargo").value.trim();
    const oficina = document.getElementById("registerOffice").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    if (!email || !password) {
      showNotification("Por favor, completa todos los campos.", false);
      return;
    }

    try {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombres,
          apellidos,
          id_cargo,
          oficina,
          email,
          password,
        }),
      };

      const response = await requestData("/users/createUser", options);

      if (response) {
        showNotification("Registro exitoso. Ahora puedes iniciar sesión.");
        //Limpiar el formulario
        document.getElementById("registerForm").reset();
      } else {
        showNotification(response.message, false);
      }
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      showNotification(
        "Error al registrar usuario. Inténtalo de nuevo más tarde.",
        false
      );
    }
  });

/**---------LISTENERS---------- */
const cargarEventListeners = () => {
  //llenar el select cuando se carga la pagina
  document.addEventListener("DOMContentLoaded", ObtenerCargos);

  //Toggle button para contraseñas
  document
    .querySelector(".button__toggle-icon")
    .addEventListener("click", togglePasswordVisibility);
};

//Llama a la funcion para cargar los listeners
cargarEventListeners();

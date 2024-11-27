import { togglePasswordVisibility } from "./utils/togglePasswordVisibility.js";
import { showNotification } from "./utils/showNotification.js";
import { requestData } from "./utils/requestData.js";

const login_form = document.getElementById("loginForm");

login_form.addEventListener("submit", async (e) => {
  //Obtener los valores de los campos de entrada
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  e.preventDefault();

  //Verificar que los campos no esten vacios
  if (!email || !password) {
    showNotification("Por favor, completa todos los campos", false);
    return;
  }

  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    };

    //Realizar la solicitud de inicio de sesión
    const response = await requestData("/login", options);

    //Manejar la respuesta de la API
    if (response) {
      //Guardar el token en el localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", response.id_usuario);
      localStorage.setItem("userEmail", response.email);
      localStorage.setItem("userAdmin", response.is_admin);

      //Redirigir a la pagina que le pertenece
      window.location.href = "../main.html";
      // if (response.is_admin) {
      //   window.location.href = "../main-admin.html";
      // } else {
      //   window.location.href = "../main.html";
      // }
    } else {
      //Mostrar el mensaje de error
      showNotification(response.message, false);
    }
  } catch (error) {
    //Manejo de errores de red o de otro tipo
    console.error("Error al iniciar sesión:", error);
    showNotification(
      "Error al iniciar sesión, Intentalo de nuevo más tarde.",
      false
    );
  }
});

/**---------LISTENERS---------- */
const cargarEventListeners = () => {
  document
    .querySelector(".button__toggle-icon")
    .addEventListener("click", togglePasswordVisibility);
};

cargarEventListeners();

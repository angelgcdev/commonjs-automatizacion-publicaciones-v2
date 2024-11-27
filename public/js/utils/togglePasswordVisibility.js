//Funcion para alternar la visibilidad de la contraseña
const togglePasswordVisibility = () => {
  const passwordField = document.querySelector(".password");
  const toggleIcon = document.querySelector(".toggleIcon");

  //Alternar entre mostrar y ocultar la contraseña
  if (passwordField.type === "password") {
    passwordField.type = "text";
    toggleIcon.src = "./assets/icons/visibility_off.svg";
  } else {
    passwordField.type = "password";
    toggleIcon.src = "./assets/icons/visibility.svg";
  }
};

export { togglePasswordVisibility };

//Funcion para cerra sesion
const logoutUser = () => {
  //Elimina el token del localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userAdmin");

  //Redirige a la página de inicio de sesión
  window.location.href = "../login.html";
};

export { logoutUser };

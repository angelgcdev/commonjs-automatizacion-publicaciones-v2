//Solicita datos al servidor y maneja la respuesta
const requestData = async (url, options) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Error en la respuesta del servidor");
    }

    return response.json();
  } catch (error) {
    // showNotification("Se produjo un error durante la solicitud.", false);
    console.error(error); // para depuracion
    return null; //retornar null para evitar errores posteriores
  }
};

export { requestData };

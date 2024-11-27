//Mostrar animación de carga
const showLoading = (text) => {
  const loadingContainer = document.createElement("div");
  loadingContainer.classList.add("loading__container");
  loadingContainer.id = "loading";

  const loadingSpinner = document.createElement("div");
  loadingSpinner.classList.add("loading__spinner");

  const loadingText = document.createElement("p");
  loadingText.classList.add("loading__text");
  loadingText.textContent = text;

  loadingContainer.appendChild(loadingSpinner);
  loadingContainer.appendChild(loadingText);

  document.body.appendChild(loadingContainer);

  return loadingContainer; //Devolver el contenedor de carga
};

export { showLoading };

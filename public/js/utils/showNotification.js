//Mostrar mensajes de notificacion
const showNotification = (message, isSuccess = true) => {
  const notification = document.createElement("div");
  notification.classList.add(
    "notification",
    isSuccess ? "notification--success" : "notification--error"
  );
  const notificationText = document.createElement("p");
  notificationText.classList.add("notification__text");
  notificationText.textContent = message;
  notification.appendChild(notificationText);
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.remove();
  }, 4000);
};

export { showNotification };

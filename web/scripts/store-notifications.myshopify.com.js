//CAMBIAR EL NOMBRE DE LAS VARIABLES!
console.log("Store notification scripts installed.");
var link = document.createElement("link");
link.href = "https://popup-tiendanube.s3.sa-east-1.amazonaws.com/shopify/store-notifications.myshopify.com.css"; // esto tiene que ser dinamico
link.rel = "stylesheet";
document.head.appendChild(link);
// Get the shop domain from the Shopify variable
const shopDomain = `https://${Shopify.shop}`;
// Connect to the socket for the current shop domain
const socket = io('http://localhost:3000', {
  query: {
    shop: shopDomain,
  },
});

const notificationDiv = document.createElement('div');
notificationDiv.className = 'notification';
notificationDiv.style.display = 'none';

// Añadimos el HTML de la notificación al elemento
notificationDiv.innerHTML = `
  <button class="notification__close-btn">&times;</button>
  <div class="notification__icon">
    <img src="../public/icons8-bell-24.png" alt="" />
  </div>
  <div class="notification__message">
    <h2></h2>
  </div>
`;

// Añadimos el elemento al final del cuerpo del documento
document.body.appendChild(notificationDiv);


// Definimos la función para mostrar la notificación
function showNotification(data) {
  // Actualizamos el contenido dinámicamente con los datos recibidos
  notificationDiv.querySelector('h2').textContent = data.message;

  notificationDiv.style.display = 'flex';

  // Agregamos la clase "show" al elemento para activar la animación
  notificationDiv.classList.add('show');

  // Agregamos un temporizador para ocultar la notificación después de unos segundos
  setTimeout(function() {
    // Quitamos la clase "show" para desactivar la animación
    notificationDiv.classList.remove('show');

    // Ocultamos la notificación después de unos segundos adicionales para dar tiempo a la animación
    setTimeout(function() {
      notificationDiv.style.display = 'none';
    }, 1000); // Ocultamos la notificación después de 1 segundos
  }, 5625); // Quitamos la clase "show" después de 5 segundos
}

function hideNotification() {
  // Quitamos la clase "show" para desactivar la animación
  notificationDiv.classList.remove('show');

  // Ocultamos la notificación después de unos segundos adicionales para dar tiempo a la animación
  setTimeout(function() {
    notificationDiv.style.display = 'none';
  }, 500); // Ocultamos la notificación después de 0.5 segundos
}

const closeButton = notificationDiv.querySelector('.notification__close-btn');
closeButton.addEventListener('click', function() {
  hideNotification();
});

// Listen for the "notification" event emitted by the server
socket.on('notification', function(data) {
  showNotification(data);
});

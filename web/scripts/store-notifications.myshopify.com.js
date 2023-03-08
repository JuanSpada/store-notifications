console.log("Store notification scripts installed.");
// Get the shop domain from the Shopify variable
const shopDomain = `https://${Shopify.shop}`;

// Connect to the socket for the current shop domain
const socket = io('http://localhost:3000', {
  query: {
    shop: shopDomain,
  },
});

// Define the function to show the notification
function showNotification(data) {
  // Show notification using data from the message
  console.log('Notification received!:', data);
}

// Listen for the "notification" event emitted by the server
socket.on('notification', function(data) {
  showNotification(data);
});

console.log("socket: ", socket);
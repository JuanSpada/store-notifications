console.log("Store notification scripts installed.");

// Get the shop domain from the Shopify variable
const shopDomain = `https://${Shopify.shop}`

// Connect to the socket for the current shop domain
// const socket = io(`http://localhost:3000/${shopDomain}`);
const socket = io(`http://localhost:3000`, {
  query: {
    shop: shopDomain,
  },
});



function showNotification(data) {
  // Show notification using data from the message
  console.log('Notification received!:', data);
}

socket.on("notification", function(data) {
  showNotification(data);
});

console.log("socket: ", socket);
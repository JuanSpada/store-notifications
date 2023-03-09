// cuando acepten la app en producción va a ver que cambiar el endpoint de los webhooks por el de /api/webhooks no?
// http://localhost:63632/webhooks

//ERRORES:

import {sendNotification} from "../helpers/socket.js"
import {getRandomSaleMessage} from "../helpers/messages.js"

export default function applyWebhooksEndpoints(app) {

  app.post("/webhooks", async (req, res) => {
    // sacamos el shopdmain de los headers.
    const headers = req.rawHeaders;
    const shopDomainIndex = headers.indexOf('x-shopify-shop-domain');
    const shopDomain = `https://${headers[shopDomainIndex + 1]}`;


    const CustomerName = req.body.customer.first_name;
    let ProductName = "";
    req.body.line_items.forEach( async item => {
      if (item.product_exists) {
        ProductName = item.name;
        return;
      }
    });

    //customizamos el mensaje
    let message = await getRandomSaleMessage(shopDomain);
    if (message.includes("[product.name]") && ProductName !== "") {
      message = message.replace("[product.name]", ProductName);
    }
    if (message.includes("[customer.name]") && CustomerName !== "") {
      message = message.replace("[customer.name]", CustomerName);
    }
    //lo mandamos al front con socket
    // HAY QUE CHEQUEAR SI TIENEN PRENDIDO O NO LOS SALES EN SETTINGS
    sendNotification(shopDomain, message)

    res.status(200).send("ok");
  });

}
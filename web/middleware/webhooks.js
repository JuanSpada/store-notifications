// cuando acepten la app en producción va a ver que cambiar el endpoint de los webhooks por el de /api/webhooks no?
// ESTO FUNCIONA DIFERENTE EN CADA STORE? CHEQUEAR AL 100% ESO, ME PARECE Q NO, Q ESTAN TODOS CONECTADOS AL MISMO SOCKET
// http://localhost:50525/webhooks


//ERRORES:

import { MessagesDB } from "../messages-db.js";

import {sendNotification} from "../helpers/socket.js"

export default function applyWebhooksEndpoints(app) {
  const getRandomMessage = async (shopDomain) => {
    const rawMessagesData = await MessagesDB.list( // CAMBIAR ESTO DESP
      // `https://${shopDomain}`
      `https://store-notifications.myshopify.com`
      );
    let randomIndex = Math.floor(Math.random() * rawMessagesData.length);
    let randomMessage = rawMessagesData[randomIndex];
    return randomMessage.value;
  }

  app.post("/webhooks", async (req, res) => {
    // sacamos el shopdmain de los headers.
    const headers = req.rawHeaders;
    const shopDomainIndex = headers.indexOf('x-shopify-shop-domain');
    const shopDomain = headers[shopDomainIndex + 1];

    const CustomerName = req.body.customer.first_name;
    let ProductName = "";
    req.body.line_items.forEach( async item => {
      if (item.product_exists) {
        ProductName = item.name;
        return;
      }
    });

    //customizamos el mensaje
    let message = await getRandomMessage(shopDomain);
    if (message.includes("[product.name]") && ProductName !== "") {
      message = message.replace("[product.name]", ProductName);
    }
    if (message.includes("[customer.name]") && CustomerName !== "") {
      message = message.replace("[customer.name]", CustomerName);
    }
    console.log("message:", message)

    //lo mandamos al front con socket
    sendNotification(shopDomain, message)

    res.status(200).send("ok");
  });

}
// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";

import applyQrCodeApiEndpoints from "./middleware/qr-code-api.js";
import applyMessagesApiEndpoints from "./middleware/messages-api.js";
import applySettingsApiEndpoints from "./middleware/settings-api.js";
import applyWebhooksEndpoints from "./middleware/webhooks.js";

import applyQrCodePublicEndpoints from "./middleware/qr-code-public.js";

// import {createSocketConnection} from "./helpers/socket.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();



// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);


// All endpoints after this point will require an active session
app.use("/api/*", shopify.validateAuthenticatedSession());
applyQrCodePublicEndpoints(app);

app.use(express.json());

applyQrCodeApiEndpoints(app);
applyMessagesApiEndpoints(app);
applySettingsApiEndpoints(app);
applyWebhooksEndpoints(app);

app.use(serveStatic(STATIC_PATH, { index: false }));

//creamos el socket
// app.use(async (req, res, next) => {
//   // Get the shop domain from the request object
//   const shopDomain = `https://${req.query.shop}`
//   // Pass the shop domain to the createSocketConnection function
//   // const socket = createSocketConnection(shopDomain);
//   // Attach the socket object to the request object so it can be accessed in downstream middleware
//   req.socket = socket;
//   next();
// });

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});


app.listen(PORT);
/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.
*/

import express from "express";

import { SettingsDB } from "../settings-db.js";
import { MessagesDB } from "../messages-db.js";
// Default Messages
import defaultMessages from '../helpers/default-messages.js';
import {
  getSettingsOr404,
  getShopUrlFromSession,
  parseSettingsBody,
  generateScript
} from "../helpers/settings.js";

import shopify from "../shopify.js";

import {sendNotification} from "../helpers/socket.js"


export default function applySettingsApiEndpoints(app) {
  app.use(express.json());

  // GET SETTINGS
  app.get("/api/settings", async (req, res) => {
    const shopDomain = await getShopUrlFromSession(req, res);

    try {
      let rawSettingsData = await SettingsDB.list(
        shopDomain
      );
      //IF DOESNT HAVE SETTINGS WE CREATE THE DEFUALT
      if (rawSettingsData.length == 0) {
        // DEFUALT MESSAGES
        try {
          for (const message of defaultMessages) {
            await MessagesDB.create({
              ...message,
              /* Get the shop from the authorization header to prevent users from spoofing the data */
              shopDomain: shopDomain,
            });
          }
        } catch (error) {
          console.error(error);
          res.status(500).send(error.message);
        }
        // DEFAULT SETTINGS
        const defaultSettings = {
          displaySalesStatus: 1,
          displayCartStatus: 1,
          displayInventoryStatus: 1,
          positionX: "right",
          positionY: "top",
          style: "elegant",
          backgroundColor: "000000",
          textColor: "FFFFFF",
          font: "default"
        }
        try {
          const id = await SettingsDB.create({
            ...defaultSettings,
            /* Get the shop from the authorization header to prevent users from spoofing the data */
            shopDomain: shopDomain,
          });
          const createdSettings = await SettingsDB.read(id);
          rawSettingsData = createdSettings
        } catch (error) {
          console.error(error);
          res.status(500).send(error.message);
        }
        // INSTALAMOS SOCKET
        const socketScript = new shopify.api.rest.ScriptTag({
          session: res.locals.shopify.session
        });
        socketScript.src = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.3.1/socket.io.min.js";
        socketScript.event = "onload";
        await socketScript.save();
        generateScript(req, res);
        // MANDAMOS EL SCRIPT // TESTEARRRR
        const script_tag  = new shopify.api.rest.ScriptTag({session: res.locals.shopify.session});
        script_tag.event = "onload";
        script_tag.src = `http://localhost:56673/scripts/${res.locals.shopify.session.shop}.js`;
        await script_tag.save({
          update: true,
        });
        //WEBHOOK DE ORDER CREATED
        const webhook = new shopify.rest.Webhook({session: session});
        webhook.address = "http://localhost:52471/api/webhooks";
        webhook.topic = "orders/create";
        webhook.format = "json";
        await webhook.save({
          update: true,
        });
        
        generateScript(req, res);
      }
      res.status(200).send(rawSettingsData[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  // EDIT SETTINGS
  app.patch("/api/settings", async (req, res) => {
    const shopDomain = await getShopUrlFromSession(req, res);
    let settings = await SettingsDB.list(
      shopDomain
    );
    if (settings) {
      try {
        await SettingsDB.update(settings[0].id, await parseSettingsBody(req));
        let updatedSettings = await SettingsDB.list(
          shopDomain
        );
        res.status(200).send(updatedSettings[0]);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });
}
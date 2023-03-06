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
} from "../helpers/settings.js";

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
      }
      res.status(200).send(rawSettingsData[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  // EDIT SETTINGS  // EDITAR ESTO PARA QUE EDITE DIRECTAMENTE LOS SETTINGS QUE CORRESPONDAN CON EL DOMAIN EN VEZ DE USAR ID
  app.patch("/api/settings", async (req, res) => {
    const shopDomain = await getShopUrlFromSession(req, res);
    let settings = await SettingsDB.list(
      shopDomain
    );
    if (settings) {
      try {
        const response = await SettingsDB.update(settings[0].id, await parseSettingsBody(req));
        res.status(200).send(response);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

}

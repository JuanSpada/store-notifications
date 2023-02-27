/*
  The custom REST API to support the app frontend.
  Handlers combine application data from qr-codes-db.js with helpers to merge the Shopify GraphQL Admin API data.
  The Shop is the Shop that the current user belongs to. For example, the shop that is using the app.
  This information is retrieved from the Authorization header, which is decoded from the request.
  The authorization header is added by App Bridge in the frontend code.
*/

import express from "express";
import { MessagesDB } from "../messages-db.js";

import {
  getMessageOr404, // lo uso
  getShopUrlFromSession, // lo uso
  parseMessageBody, // lo uso
} from "../helpers/messages.js";

export default function applyMessagesApiEndpoints(app) { 
  app.use(express.json());

  app.get("/api/messages", async (req, res) => { // testear
    console.log("entro aca!!")
    try {
      const rawCodeData = await MessagesDB.list(
        await getShopUrlFromSession(req, res)
      );
      res.status(200).send(rawCodeData);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/messages", async (req, res) => { // testear
    try {
      const id = await MessagesDB.create({
        ...(await parseMessageBody(req)),

        /* Get the shop from the authorization header to prevent users from spoofing the data */
        shopDomain: await getShopUrlFromSession(req, res),
      });
      console.log("Created message: ", id) // testear bien esto
      res.status(201).send(id);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/messages/:id", async (req, res) => { // testear
    const message = await getMessageOr404(req, res);

    if (message) {
      try {
        const response = await MessagesDB.update(req.params.id, await parseMessageBody(req));
        res.status(200).send(response);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/api/messages/:id", async (req, res) => { // testear esto
    const message = await getMessageOr404(req, res);

    if (message) {
      res.status(200).send(message);
    }
  });

  app.delete("/api/messages/:id", async (req, res) => { // testear esto
    const message = await getMessageOr404(req, res);

    if (message) {
      await MessagesDB.delete(req.params.id);
      res.status(200).send();
    }
  });
}

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
  getMessageOr404,
  getShopUrlFromSession,
  parseMessageBody,
} from "../helpers/messages.js";

export default function applyMessagesApiEndpoints(app) { 
  app.use(express.json());

  // GET MESSAGES
  app.get("/api/messages", async (req, res) => {
    try {
      const rawMessagesData = await MessagesDB.list(
        await getShopUrlFromSession(req, res)
      );
      res.status(200).send(rawMessagesData);
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  // CHANGE MESSAGE STATUS
  app.patch("/api/messages/stop/:id", async (req, res) => {
    const message = await getMessageOr404(req, res);
    if (message) {
      try {
        await MessagesDB.__changeMessageStatus(req.params.id, await parseMessageBody(req));
        const response =  await MessagesDB.read(req.params.id);
        res.status(200).send(response[0]);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const id = await MessagesDB.create({
        ...(await parseMessageBody(req)),

        /* Get the shop from the authorization header to prevent users from spoofing the data */
        shopDomain: await getShopUrlFromSession(req, res),
      });
      const createdMessage = await MessagesDB.read(id);
      res.status(201).send(createdMessage[0]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.patch("/api/messages/:id", async (req, res) => {
    const message = await getMessageOr404(req, res);

    if (message) {
      try {
        const response = await MessagesDB.update(req.params.id, await parseMessageBody(req));
        res.status(200).send(response[0]);
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    const message = await getMessageOr404(req, res);

    if (message) {
      res.status(200).send(message);
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    const message = await getMessageOr404(req, res);

    if (message) {
      await MessagesDB.delete(req.params.id);
      res.status(200).send();
    }
  });
}

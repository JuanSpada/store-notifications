/*
  This file interacts with the app's database and is used by the app's REST APIs.
*/

import sqlite3 from "sqlite3";
import path from "path";

const DEFAULT_DB_FILE = path.join(process.cwd(), "store_notifications.sqlite");

export const SettingsDB = {
  settingsTableName: "settings",
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    displaySalesStatus,
    displayCartStatus,
    displayInventoryStatus,
    positionX,
    positionY,
    style,
    backgroundColor,
    textColor,
    font
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.settingsTableName}
      (shopDomain, displaySalesStatus, displayCartStatus, displayInventoryStatus, positionX, positionY, style, backgroundColor, textColor, font)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      displaySalesStatus,
      displayCartStatus,
      displayInventoryStatus,
      positionX,
      positionY,
      style,
      backgroundColor,
      textColor,
      font
    ]);
    return rawResults[0].id;
  },

  update: async function (
    id,
    {
      displaySalesStatus,
      displayCartStatus,
      displayInventoryStatus,
      positionX,
      positionY,
      style,
      backgroundColor,
      textColor,
      font
    }
  ) {
    await this.ready;
  
    const query = `
      UPDATE ${this.settingsTableName}
      SET
        displaySalesStatus = ?,
        displayCartStatus = ?,
        displayInventoryStatus = ?,
        positionX = ?,
        positionY = ?,
        style = ?,
        backgroundColor = ?,
        textColor = ?,
        font = ?
      WHERE
        id = ?;
    `;
    await this.__query(query, [
      displaySalesStatus,
      displayCartStatus,
      displayInventoryStatus,
      positionX,
      positionY,
      style,
      backgroundColor,
      textColor,
      font,
      id
    ]);
    return true;
  },

  list: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.settingsTableName}
      WHERE shopDomain = ?;
    `;
  
    const results = await this.__query(query, [shopDomain]);
    return results;
  },
  

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.settingsTableName}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return rows;
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.settingsTableName}
      WHERE id = ?;
    `;
    await this.__query(query, [id]);
    return true;
  },

  /*
    Used to check whether to create the database.
    Also used to make sure the database and table are set up before the server starts.
  */

  __hasSettingsTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.settingsTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {
    /* Initializes the connection to the database */
    this.db = new sqlite3.Database(DEFAULT_DB_FILE);
    const hasMessagesTable = await this.__hasSettingsTable();
    
    if (hasMessagesTable) {
      this.ready = Promise.resolve();
    } else {
      const query = `
        CREATE TABLE ${this.settingsTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          displaySalesStatus INTEGER,
          displayCartStatus INTEGER,
          displayInventoryStatus INTEGER,
          positionX VARCHAR(511) NOT NULL,
          positionY VARCHAR(511) NOT NULL,
          style VARCHAR(511) NOT NULL,
          backgroundColor VARCHAR(511) NOT NULL,
          textColor VARCHAR(511) NOT NULL,
          font VARCHAR(511) NOT NULL
        )
      `;
      /* Tell the various CRUD methods that they can execute */
      this.ready = this.__query(query);
    }
  },

  /* Perform a query on the database. Used by the various CRUD methods. */
  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },
};

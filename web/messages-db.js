/*
  This file interacts with the app's database and is used by the app's REST APIs.
*/

import sqlite3 from "sqlite3";
import path from "path";

const DEFAULT_DB_FILE = path.join(process.cwd(), "messages_db.sqlite");

export const QRCodesDB = {
  qrCodesTableName: "messages",
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    value,
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.qrCodesTableName}
      (shopDomain, value, impressions)
      VALUES (?, ?, 0)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      value,
    ]);

    return rawResults[0].id;
  },

  update: async function (
    id,
    {
      value
    }
  ) {
    await this.ready;

    const query = `
      UPDATE ${this.qrCodesTableName}
      SET
        value = ?
      WHERE
        id = ?;
    `;

    await this.__query(query, [
      value,
      id,
    ]);
    return true;
  },

  list: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE shopDomain = ?;
    `;

    // const results = await this.__query(query, [shopDomain]);
    // return results.map((qrcode) => this.__addImageUrl(qrcode));
    return await this.__query(query, [shopDomain]);
  },

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    // return this.__addImageUrl(rows[0]);
    return rows; // OJO NO ES [0]??
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    await this.__query(query, [id]);
    return true;
  },

  /*
    Used to check whether to create the database.
    Also used to make sure the database and table are set up before the server starts.
  */

  __hasMessagesTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.qrCodesTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {

    /* Initializes the connection to the database */
    this.db = new sqlite3.Database(DEFAULT_DB_FILE);
    const hasQrCodesTable = await this.__hasMessagesTable();

    if (hasQrCodesTable) {
      this.ready = Promise.resolve();

      /* Create the QR code table if it hasn't been created */
    } else {
      const query = `
        CREATE TABLE ${this.qrCodesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          value VARCHAR(511) NOT NULL,
          impressions INTEGER
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

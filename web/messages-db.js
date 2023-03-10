/*
  This file interacts with the app's database and is used by the app's REST APIs.
*/

import sqlite3 from "sqlite3";
import path from "path";

const DEFAULT_DB_FILE = path.join(process.cwd(), "store_notifications.sqlite");

export const MessagesDB = {
  messagesTableName: "messages",
  db: null,
  ready: null,

  create: async function ({
    shopDomain,
    value,
    type
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.messagesTableName}
      (shopDomain, value, type, impressions, status)
      VALUES (?, ?, ?, 0, 1)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      value,
      type,
    ]);
    return rawResults[0].id;
  },

  update: async function (
    id,
    {
      value,
      type
    }
  ) {
    await this.ready;

    const query = `
      UPDATE ${this.messagesTableName}
      SET
        value = ?,
        type = ?
      WHERE
        id = ?;
    `;

    await this.__query(query, [
      value,
      type,
      id,
    ]);
    return true;
  },

  list: async function (shopDomain) { // vamos a tener que cambiar esto, no usar mas los default y hacer que se creen en un principio y de paso los hacemos editables
    await this.ready;
    const query = `
      SELECT * FROM ${this.messagesTableName}
      WHERE shopDomain = ?;
    `;
  
    const results = await this.__query(query, [shopDomain]);
    return results;
  },
  

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.messagesTableName}
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
      DELETE FROM ${this.messagesTableName}
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
    const rows = await this.__query(query, [this.messagesTableName]);
    return rows.length === 1;
  },

  /* Initializes the connection with the app's sqlite3 database */
  init: async function () {
    /* Initializes the connection to the database */
    this.db = new sqlite3.Database(DEFAULT_DB_FILE);
    const hasMessagesTable = await this.__hasMessagesTable();
    
    if (hasMessagesTable) {
      this.ready = Promise.resolve();
    } else {
      const query = `
        CREATE TABLE ${this.messagesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          value VARCHAR(511) NOT NULL,
          type VARCHAR(511) NOT NULL,
          impressions INTEGER,
          status INTEGER
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

  /* Change message status. */
  __changeMessageStatus: async function (id,
    {
      status
    }) {
    const query = `
      UPDATE ${this.messagesTableName}
      SET status = ?
      WHERE id = ?
    `;
    await this.__query(query, [
      status,
      id,
    ]);
    return true;
  },
};

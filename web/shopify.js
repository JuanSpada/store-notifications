import { BillingInterval, LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-01";
import { join } from "path";
import { QRCodesDB } from "./qr-codes-db.js";
import { MessagesDB } from "./messages-db.js";
import { SettingsDB } from "./settings-db.js";

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "Monthly plan": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    trialDays: 7,
    interval: BillingInterval.Every30Days,
    // replacementBehavior: BillingReplacementBehavior.APPLY_IMMEDIATELY,
  },
  'Anual Plan': {
    interval: BillingInterval.Annual,
    amount: 50,
    trialDays: 7,
    currencyCode: 'USD',
    // replacementBehavior: BillingReplacementBehavior.APPLY_IMMEDIATELY,
  },
};

const dbFile = join(process.cwd(), "database.sqlite");
const sessionDb = new SQLiteSessionStorage(dbFile);
// Initialize SQLite DB
QRCodesDB.db = sessionDb.db;
QRCodesDB.init();
MessagesDB.db = sessionDb.db;
MessagesDB.init();
SettingsDB.db = sessionDb.db;
SettingsDB.init();
const shopify = shopifyApp({
  api: {
    apiVersion: LATEST_API_VERSION,
    restResources,
    billing: billingConfig, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: sessionDb,
}); 
export default shopify;

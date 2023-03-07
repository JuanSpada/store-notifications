import { SettingsDB } from "../settings-db.js";
import fs from 'fs';

/*
  The app's database stores the productId and the discountId.
  This query is used to get the fields the frontend needs for those IDs.
  By querying the Shopify GraphQL Admin API at runtime, data can't become stale.
  This data is also queried so that the full state can be saved to the database, in order to generate QR code links.
*/

export async function getSettingsOr404(req, res, checkDomain = true) {
  try {
    const response = await SettingsDB.read(req.params.id);
    if (
      (checkDomain && (await getShopUrlFromSession(req, res)) !== response[0].shopDomain) &&
      (await getShopUrlFromSession(req, res) === "default")
    ) {
      res.status(404).send();
    } else {
      return response[0];
    }
  } catch (error) {
    res.status(500).send(error.message);
  }

  return undefined;
}

export async function getShopUrlFromSession(req, res) {
  return `https://${res.locals.shopify.session.shop}`;
}

/*
Expect body to contain
value: string
type: string
status: integer
*/
export async function parseSettingsBody(req, res) {
  const displaySalesStatus = req.body.displaySalesStatus ? 1 : 0;
  const displayCartStatus = req.body.displayCartStatus ? 1 : 0;
  const displayInventoryStatus = req.body.displayInventoryStatus ? 1 : 0;
  return {
    displaySalesStatus: displaySalesStatus,
    displayCartStatus: displayCartStatus,
    displayInventoryStatus: displayInventoryStatus,
    positionX: req.body.positionX[0],
    positionY: req.body.positionY[0],
    style: req.body.style,
    backgroundColor: req.body.backgroundColor,
    textColor: req.body.textColor,
    font: req.body.font
  };
}

// GENERATE SCRIPT FUNCTION
export async function generateScript(req, res) {
  const script = `console.log("Store notification scripts installed.");`;
  const filePath = `scripts/${res.locals.shopify.session.shop}.js`;
  
  fs.writeFile(filePath, script, (err) => {
    if (err) {
      console.error(`Error writing file ${filePath}: ${err}`);
    } else {
      console.log(`File ${filePath} written successfully.`);
    }
  });
}

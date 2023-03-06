import { SettingsDB } from "../settings-db.js";

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
  return {
    displaySalesStatus: req.body.displaySalesStatus,
    displayCartStatus: req.body.displayCartStatus,
    displayInventoryStatus: req.body.displayInventoryStatus,
    positionX: req.body.positionX,
    positionY: req.body.positionY,
    style: req.body.style,
    backgroundColor: req.body.backgroundColor,
    textColor: req.body.textColor,
    font: req.body.font
  };
}
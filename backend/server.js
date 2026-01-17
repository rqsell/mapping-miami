require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const fetch = require("node-fetch"); // v2

const app = express();

// ==============================
// ✅ CORS
// ==============================
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({ origin: FRONTEND_URL }));
app.use(bodyParser.json());

// ==============================
// ✅ Validate env
// ==============================
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
}
if (!process.env.SPREADSHEET_ID) {
  throw new Error("Missing SPREADSHEET_ID");
}

// ==============================
// ✅ Decode service account
// ==============================
const decoded = Buffer.from(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
  "base64"
).toString("utf8");
const keys = JSON.parse(decoded);

// ==============================
// ✅ Google Auth
// ==============================
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// ==============================
// ✅ Geocoding
// ==============================
async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "MyApp/1.0 (contact@yourdomain.com)" },
  });

  const data = await res.json();
  if (!data[0]) throw new Error("Address not found");

  const cleanCoordinate = (value) =>
    Number(String(value).replace(/'/g, "").trim());

  return {
    latitude: cleanCoordinate(Number(data[0].lat)),
    longitude: cleanCoordinate(Number(data[0].lon)),
  };
}

// ==============================
// 🔥 Force number formatting on columns
// ==============================
async function forceNumberColumns(sheets, sheetId) {
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startColumnIndex: 2, // C = longitude
              endColumnIndex: 4,   // D = latitude
            },
            cell: {
              userEnteredFormat: {
                numberFormat: {
                  type: "NUMBER",
                  pattern: "0.0000000",
                },
              },
            },
            fields: "userEnteredFormat.numberFormat",
          },
        },
      ],
    },
  });
}

// ==============================
// 🚀 INIT: force number format once
// ==============================
(async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // Get sheetId dynamically
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === "miami-data");
  const sheetId = sheet.properties.sheetId;

  await forceNumberColumns(sheets, sheetId);
  console.log("✅ Latitude / Longitude columns forced to NUMBER");
})();

// ==============================
// ✅ POST endpoint
// ==============================
app.post("/add-item", async (req, res) => {
  try {
    const { name, location, title, imageUrl, description } = req.body;

    let latitude = null;
    let longitude = null;

    if (location) {
      try {
        const coords = await geocodeAddress(location);
        latitude = coords.latitude;
        longitude = coords.longitude;
      } catch (err) {
        console.error("Geocoding failed:", err.message);
      }
    }

    // DEBUG: check types before sending to Sheets
    console.log({
      latitude,
      longitude,
      latType: typeof latitude,
      lngType: typeof longitude
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    // Get sheetId dynamically
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === "miami-data");
    const sheetId = sheet.properties.sheetId;

    // Append row using appendCells with numberValue
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            appendCells: {
              sheetId: sheetId,
              rows: [
                {
                  values: [
                    { userEnteredValue: { stringValue: name || "" } },
                    { userEnteredValue: { stringValue: title || "" } },
                    { userEnteredValue: { numberValue: longitude || 0 } },
                    { userEnteredValue: { numberValue: latitude || 0 } },
                    { userEnteredValue: { stringValue: imageUrl || "" } },
                    { userEnteredValue: { stringValue: description || "" } },
                  ],
                },
              ],
              fields: "userEnteredValue",
            },
          },
        ],
      },
    });

    console.log("Sheets append OK:", response.data);
    res.status(200).json({ status: "success" });

  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  }
});

// ==============================
// ✅ Start server
// ==============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

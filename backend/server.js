require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { google } = require("googleapis");
const fetch = require("node-fetch"); // v2

const app = express();
const multer = require('multer');

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
// for larger image sizes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//CORS
app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost and any Vercel URL
    if (
      origin === 'http://localhost:3000' ||
      origin.includes('vercel.app') ||
      origin === process.env.FRONTEND_URL
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(bodyParser.json());

//Validate ENV
if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
  throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
}
if (!process.env.SPREADSHEET_ID) {
  throw new Error("Missing SPREADSHEET_ID");
}

//base64 decode
const decoded = Buffer.from(
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
  "base64"
).toString("utf8");
const keys = JSON.parse(decoded);

//google auth for spreadsheets
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ["https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file"  // for image file
]
  
});
//image to drive folder and get link
async function uploadToDrive(file, auth) {
  const drive = google.drive({ version: 'v3', auth });
  
  const fileMetadata = {
    name: file.originalname,
    parents: ['root'] // or specify a folder ID
  };
  
  const media = {
    mimeType: file.mimetype,
    body: require('stream').Readable.from(file.buffer)
  };
  
  const driveFile = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink, webContentLink'
  });
  
  // Make file publicly accessible
  await drive.permissions.create({
    fileId: driveFile.data.id,
    requestBody: {
      role: 'reader',
      type: 'anyone'
    }
  });
  
  // Return a direct image URL
  return `https://drive.google.com/uc?export=view&id=${driveFile.data.id}`;
}

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

//geocoding for lng/lat
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

//columns formating to avoid errors
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

//number formating force
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

//post end
app.post("/add-item", upload.single('image'), async (req, res) => {
  try {
    console.log("=== RECEIVED DATA ===");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("===================");
    
    const { name, location, title, imageUrl, description, workshopLocation } = req.body;

    // ✅ Handle file upload to Google Drive
    let finalImageUrl = imageUrl || "";
    
    if (req.file) {
      const client = await auth.getClient();
      finalImageUrl = await uploadToDrive(req.file, client);
      console.log("✅ File uploaded to Drive:", finalImageUrl);
    }

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

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === "miami-data");
    const sheetId = sheet.properties.sheetId;

    await sheets.spreadsheets.batchUpdate({
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
                    { userEnteredValue: { stringValue: finalImageUrl } }, // ✅ Drive URL
                    { userEnteredValue: { stringValue: description || "" } },
                    { userEnteredValue: { stringValue: workshopLocation || "" } }, 
                  ],
                },
              ],
              fields: "userEnteredValue",
            },
          },
        ],
      },
    });

    res.status(200).json({ status: "success" });

  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  }
});

//start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Explicitly setting redirect URI
oAuth2Client.redirectUri = REDIRECT_URI;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Generate Auth URL
const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive.file"],
  redirect_uri: REDIRECT_URI,  // Ensure redirect URI is passed
});

console.log("Authorize this app by visiting this URL:", authUrl);

rl.question("Enter the code from that page here: ", async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  console.log("Your Refresh Token:", tokens.refresh_token);
  rl.close();
});


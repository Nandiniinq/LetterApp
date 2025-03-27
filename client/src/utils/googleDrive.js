import { gapi } from "gapi-script";

const CLIENT_ID = "323498899028-lrn9usigeqnpuen9sacdr97815nmv32l.apps.googleusercontent.com";
const API_KEY = "xt4mcv60z6ofctgqqvszjsas1uau941q2fvsllinoju2u81c";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/drive.file";

let tokenClient; // Store token client globally
let gapiInitialized = false;

const checkGapiLoaded = () => {
  return window.gapi && window.gapi.client;
};

export const initializeGapi = async () => {
  return new Promise((resolve, reject) => {
    if (gapiInitialized) {
      resolve(); // Already initialized, no need to re-authenticate
      return;
    }

    gapi.load("client", async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });

        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              gapi.client.setToken(response);
              gapiInitialized = true;
              console.log("✅ Google API Initialized & Authenticated");
              resolve();
            } else {
              console.error("❌ Google Authentication Failed");
              reject("Authentication failed");
            }
          },
        });

        // Request access only if there's no existing token
        if (!gapi.client.getToken()) {
          tokenClient.requestAccessToken();
        } else {
          gapiInitialized = true;
          resolve();
        }
      } catch (error) {
        console.error("❌ Google API Initialization Failed:", error);
        reject(error);
      }
    });
  });
};

const getOrCreateFolder = async () => {
  try {
    await initializeGapi();
    if (!checkGapiLoaded()) return;

    const response = await gapi.client.drive.files.list({
      q: "name='Letters' and mimeType='application/vnd.google-apps.folder'",
      fields: "files(id)",
    });

    if (response.result.files.length > 0) {
      return response.result.files[0].id;
    }

    const folder = await gapi.client.drive.files.create({
      resource: {
        name: "Letters",
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
    });

    return folder.result.id;
  } catch (error) {
    console.error("❌ Error getting/creating folder:", error);
  }
};
export const getFileContent = async (fileId) => {
    try {
      const response = await gapi.client.drive.files.get({
        fileId,
        alt: "media",
      });
  
      return response.body;
    } catch (error) {
      console.error("❌ Error fetching file content:", error);
      return "";
    }
  };
  
export const saveLetterToDrive = async (title, content) => {
  try {
    await initializeGapi();
    if (!checkGapiLoaded()) return;

    const folderId = await getOrCreateFolder();
    if (!folderId) return;

    // Convert content to Blob (Fixes blank file issue)
    const blob = new Blob([content], { type: "text/html" });
    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify({ name: title || "New Letter", parents: [folderId] })], { type: "application/json" }));
    formData.append("file", blob);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: new Headers({ Authorization: `Bearer ${gapi.client.getToken().access_token}` }),
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Letter saved:", result.id);
    alert("Letter saved successfully!");
    return result.id;
  } catch (error) {
    console.error("❌ Error saving letter:", error);
  }
};

export const fetchSavedLetters = async () => {
  try {
    await initializeGapi();
    if (!checkGapiLoaded()) return [];

    const folderId = await getOrCreateFolder();
    if (!folderId) return [];

    const response = await gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      fields: "files(id, name)",
    });

    console.log("📂 Retrieved letters from Drive:", response.result.files);
    return response.result.files;
  } catch (error) {
    console.error("❌ Error fetching saved letters:", error);
    return [];
  }
};


  
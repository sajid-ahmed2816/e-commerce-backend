const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const initialize = () => {
  if (admin.apps.length) return;

  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } else {
    const serviceAccountPath = path.join(__dirname, "firebase-service-account.json");
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error("Firebase Admin is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON.");
    }
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  }

  // Vercel environment variables are sometimes pasted with the private key's
  // newline escapes preserved. Normalize both escaped and actual newlines.
  if (typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
};

module.exports = {
  auth() {
    initialize();
    return admin.auth();
  }
};

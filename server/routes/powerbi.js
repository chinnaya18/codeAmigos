// server/routes/powerbi.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const msal = require("@azure/msal-node");

require("dotenv").config();

const {
  POWERBI_TENANT_ID,
  POWERBI_CLIENT_ID,
  POWERBI_CLIENT_SECRET,
  POWERBI_WORKSPACE_ID,
  POWERBI_REPORT_ID,
} = process.env;

if (!POWERBI_TENANT_ID || !POWERBI_CLIENT_ID || !POWERBI_CLIENT_SECRET) {
  console.warn(
    "Power BI env vars missing; powerbi route will fail until configured."
  );
}

// create MSAL confidential client
const cca = new msal.ConfidentialClientApplication({
  auth: {
    clientId: POWERBI_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${POWERBI_TENANT_ID}`,
    clientSecret: POWERBI_CLIENT_SECRET,
  },
});

// Scopes required for Power BI REST API
const SCOPES = ["https://analysis.windows.net/powerbi/api/.default"];

// GET embed info for the report
router.get("/embed", async (req, res) => {
  try {
    // 1) Acquire AAD token
    const authResponse = await cca.acquireTokenByClientCredential({
      scopes: SCOPES,
    });

    if (!authResponse || !authResponse.accessToken) {
      return res
        .status(500)
        .json({ msg: "Failed to acquire AAD token for Power BI" });
    }

    const aadToken = authResponse.accessToken;

    // 2) Get report info (embedUrl)
    const reportUrl = `https://api.powerbi.com/v1.0/myorg/groups/${POWERBI_WORKSPACE_ID}/reports/${POWERBI_REPORT_ID}`;
    const reportRes = await axios.get(reportUrl, {
      headers: { Authorization: `Bearer ${aadToken}` },
    });

    const report = reportRes.data; // contains embedUrl, id, name

    // 3) Generate an embed token for the report (server-to-server)
    const generateTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${POWERBI_WORKSPACE_ID}/reports/${POWERBI_REPORT_ID}/GenerateToken`;
    // request body: can include accessLevel: "View" or "Edit"
    const tokenReqBody = { accessLevel: "View" };

    const tokenRes = await axios.post(generateTokenUrl, tokenReqBody, {
      headers: { Authorization: `Bearer ${aadToken}` },
    });

    const embedToken = tokenRes.data.token; // token string
    const embedTokenExpiry = tokenRes.data.expiration; // expiry

    // 4) return to frontend minimal safe payload
    return res.json({
      reportId: report.id,
      reportName: report.name,
      embedUrl: report.embedUrl,
      embedToken,
      embedTokenExpiry,
      // sample uploaded file path (from your uploaded file; the UI may use it)
      reportFileUrl: "/mnt/data/6f0625c8-21cd-4061-8de4-1925541246c0.png",
    });
  } catch (err) {
    console.error(
      "Power BI embed error:",
      err?.response?.data || err.message || err
    );
    return res
      .status(500)
      .json({ msg: "Power BI embed failed", detail: err?.message || err });
  }
});

module.exports = router;

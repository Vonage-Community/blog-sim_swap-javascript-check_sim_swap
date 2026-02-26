require("dotenv").config();
const path = require("path");
const express = require("express");
const { IdentityInsights } = require("@vonage/identity-insights");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const users = {
  user1: { password: "123", phoneNumber: process.env.PHONE_NUMBER }
};

const APPLICATION_ID = process.env.VONAGE_APPLICATION_ID;
const PRIVATE_KEY = process.env.VONAGE_PRIVATE_KEY;
const PERIOD = process.env.PERIOD;

// Bootstrap Step
if (!APPLICATION_ID || !PRIVATE_KEY) {
  console.error("VONAGE_APPLICATION_ID or VONAGE_PRIVATE_KEY not set");
  process.exit(1);
}

const keyContent = fs.existsSync(PRIVATE_KEY)
  ? fs.readFileSync(PRIVATE_KEY, "utf8")
  : PRIVATE_KEY;

if (!keyContent) {
  console.error(
    "INVALID private key. Check if the file exists or the environment variable is correctly set"
  );
  process.exit(1);
}

const identityClient = new IdentityInsights({
  applicationId: APPLICATION_ID,
  privateKey: keyContent,
});

async function checkSim(phoneNumber) {
  try {
    const resp = await identityClient.getIdentityInsights({
      phoneNumber: phoneNumber,
      purpose: "FraudPreventionAndDetection",
      insights: {
        format: {},
        originalCarrier: {},
        currentCarrier: {},
        simSwap: {
          period: parseInt(PERIOD),
        },
      },
    });

    return resp.insights?.simSwap?.isSwapped === true;
  } catch (error) {
    console.warn("Identity Insights SDK call failed:", error && error.message);
  }
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main.html"));
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
      const simSwapped = await checkSim(user.phoneNumber);
      if (simSwapped) {
        return res.status(401).json({ message: "SIM Swapped" });
      } else {
        res.json({ message: "Success" });
      }
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Error processing request." });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
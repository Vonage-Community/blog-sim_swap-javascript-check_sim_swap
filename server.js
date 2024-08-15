require("dotenv").config();
const path = require("path");
const express = require("express");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(express.static("public"));

// This is a demo example with the fake credentials of user one, in a real
// world example you'd have to store your credentials safely.
const users = {
  user1: {
    username: process.env.PHONE_NUMBER,
    password: "123",
    phoneNumber: process.env.PHONE_NUMBER,
  },
};

// Serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Serve the main.html file
app.get("/main", (req, res) => {
  res.sendFile(path.join(__dirname, "views/main.html"));
});

const authReqUrl = "https://api-eu.vonage.com/oauth2/bc-authorize";
const tokenUrl = "https://api-eu.vonage.com/oauth2/token";
const simSwapApiUrl = "https://api-eu.vonage.com/camara/sim-swap/v040/check";

// Authenticate function for SIM Swap API
async function authenticate(phone, scope) {
  const authReqResponse = await axios.post(
    authReqUrl,
    {
      login_hint: phone,
      scope: scope,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.JWT}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  const tokenResponse = await axios.post(
    tokenUrl,
    {
      auth_req_id: authReqResponse.data.auth_req_id,
      grant_type: "urn:openid:params:grant-type:ciba",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.JWT}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return tokenResponse.data.access_token;
}

async function checkSim(phoneNumber) {
  const accessToken = await authenticate(
    phoneNumber,
    "dpv:FraudPreventionAndDetection#check-sim-swap"
  );
  const response = await axios.post(
    simSwapApiUrl,
    {
      phoneNumber: phoneNumber,
      maxAge: process.env.MAX_AGE,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.swapped;
}

app.post("/simswap", async (req, res) => {
  const username = req.body.username;
  const user = users[username];
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const simSwapped = await checkSim(user.phoneNumber);
    res.json({ swapped: simSwapped });
  } catch (error) {
    console.error("Error checking SIM swap:", error);
    res.status(500).json({ message: "Error processing request." });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (user && user.password === password) {
    res.json({ message: "Success" });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

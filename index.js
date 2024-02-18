// server.js
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const crypto = require("crypto");
const PORT = 3001;
const cors = require("cors"); // Import cors middleware

// Middleware
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "app working" });
});

// Login Endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // Authenticate user with provided credentials

    const payload = {
      username: username,
      password: password,
    };

    const apiData = await axios.post(
      "https://staging.giftlov.com/api/Base/generateToken",
      payload
    );

    return res.json({
      success: true,
      message: "app working",
      data: apiData.data.token,
    });
  } catch (err) {
    return res.json({ success: false, message: err });
  }
});


app.post("/verify", async (req, res) => {
  try {
    const { token } = req.body;

    console.log(req.body);

    const currentDate = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false, // Use 24-hour format
      })
      .replace(/\/|,|\s|:/g, "");

    const secretKey = "coding_challenge_1";

    const payload = `itemsGET1100EN${currentDate}${token}`;

    const hmac = crypto.createHmac("sha512", secretKey);
    hmac.update(payload);
    const signature = hmac.digest("hex");

    const response = await axios.get(
      "https://staging.giftlov.com/api/Base/items",
      {
        params: {
          current: 1,
          lang: "EN",
          rowCount: 100,
        },
        headers: {
          "X-GIFTLOV-DATE": currentDate,
          signature: signature,
          Authorization: token,
        },
      }
    );

    
    if (response.data) {
        console.log(response.data);
      return res.json({
        data: signature,
        date: currentDate,
        authToken: token,
        response: response.data,
        success: true,
      });
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    return res.json({ success: false });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

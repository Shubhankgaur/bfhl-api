const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.json());

const EMAIL = process.env.OFFICIAL_EMAIL;

const fibonacci = (n) => {
  let a = 0, b = 1, arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(a);
    [a, b] = [b, a + b];
  }
  return arr;
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++)
    if (n % i === 0) return false;
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const lcm = (a, b) => (a * b) / gcd(a, b);

app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1)
      return res.status(400).json({ is_success: false });

    const key = keys[0];
    const val = req.body[key];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacci(val);
        break;
      case "prime":
        data = val.filter(isPrime);
        break;
      case "lcm":
        data = val.reduce((a, b) => lcm(a, b));
        break;
      case "hcf":
        data = val.reduce((a, b) => gcd(a, b));
        break;
      case "AI":
        const ai = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [{ parts: [{ text: val }] }]
          }
        );
        data = ai.data.candidates[0].content.parts[0].text.split(" ")[0];
        break;
      default:
        return res.status(400).json({ is_success: false });
    }

    res.json({
      is_success: true,
      official_email: EMAIL,
      data
    });

  } catch (err) {
    res.status(500).json({ is_success: false });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

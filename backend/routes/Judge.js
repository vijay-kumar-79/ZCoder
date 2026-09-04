const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// Base URL of the judge service (deployment-dependent, override via JUDGE_API_URL)
const JUDGE_API_URL = (process.env.JUDGE_API_URL || "http://35.200.191.27:8000").replace(/\/+$/, "");

// Pass-through proxy: every /api/judge/* request is forwarded to the judge
// service. The judge API sends no CORS headers, so proxying it through this
// same-origin backend keeps the browser happy (and hides the judge URL).
router.use(async (req, res) => {
  const targetPath = req.originalUrl.replace(/^\/api\/judge/, "");
  try {
    const response = await axios({
      method: req.method,
      url: `${JUDGE_API_URL}${targetPath}`,
      // Only GET/HEAD skip a body; axios ignores `data` otherwise.
      data: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      // Pass the judge's own status/body through (400, 404, 413, ...).
      validateStatus: () => true,
      timeout: 35000,
    });
    res.status(response.status).send(response.data);
  } catch (err) {
    console.error("Judge proxy error:", err.message);
    res.status(502).json({ error: "Judge service is unreachable. Please try again." });
  }
});

module.exports = router;

const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// The LeetCode problem-list mirrors cap every response at 100 problems but
// honor `skip`, so we page through them. Results are slimmed to only the
// fields the frontend uses and cached in memory for CACHE_TTL_MS, making
// every visit after the first near-instant.
const PROBLEMS_API_URL = (
  process.env.PROBLEMS_API_URL || "https://leetcode-api-mu.vercel.app"
).replace(/\/+$/, "");
const PAGE_SIZE = 100;
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

let cache = null; // { payload, fetchedAt }

const slim = (p) => ({
  questionFrontendId: p.questionFrontendId,
  title: p.title,
  titleSlug: p.titleSlug,
  difficulty: p.difficulty,
  acRate: p.acRate,
  isPaidOnly: p.isPaidOnly,
  topicTags: (p.topicTags || []).map((t) => ({ name: t.name, slug: t.slug })),
});

async function withRetry(fn) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= MAX_ATTEMPTS) throw err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

async function fetchPage(skip) {
  const res = await withRetry(() =>
    axios.get(`${PROBLEMS_API_URL}/problems`, {
      params: { limit: PAGE_SIZE, skip },
      timeout: 60000,
    })
  );
  return res.data;
}

async function fetchAllProblems() {
  // First page also reports totalQuestions, so we know how many pages to pull.
  const firstRes = await fetchPage(0);
  const all = firstRes.problemsetQuestionList || [];
  const total = firstRes.totalQuestions || all.length;

  // Fetch subsequent pages in small concurrent batches (each response is
  // capped at PAGE_SIZE problems by the upstream API).
  for (let skip = PAGE_SIZE; skip < total; skip += PAGE_SIZE * CONCURRENCY) {
    const skips = [];
    for (let s = skip; s < total && s < skip + PAGE_SIZE * CONCURRENCY; s += PAGE_SIZE) {
      skips.push(s);
    }
    const pages = await Promise.all(skips.map((s) => fetchPage(s)));
    pages.forEach((res) => all.push(...(res.problemsetQuestionList || [])));
  }

  return {
    totalQuestions: total,
    problemsetQuestionList: all.map(slim),
  };
}

router.get("/", async (req, res) => {
  try {
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return res.json(cache.payload);
    }
    const payload = await fetchAllProblems();
    cache = { payload, fetchedAt: Date.now() };
    res.json(payload);
  } catch (err) {
    console.error("Failed to fetch problem list:", err.message);
    // Serve stale cache if a refresh failed mid-way
    if (cache) return res.json(cache.payload);
    res.status(502).json({ error: "Could not load problems. Please try again later." });
  }
});

module.exports = router;

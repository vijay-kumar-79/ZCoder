// Central place for the JWT secret.
// In production the secret MUST come from the environment. The insecure
// fallback exists only so the app can run locally without setup.
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? null : "dev-insecure-secret-change-me");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
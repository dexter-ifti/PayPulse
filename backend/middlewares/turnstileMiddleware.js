const dotenv = require("dotenv");
dotenv.config();

const TURNSTILE_VERIFY_URL =
    "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Express middleware that verifies a Cloudflare Turnstile token sent in the
 * request body.
 *
 * Expects `turnstileToken` in the JSON body. Calls Cloudflare's siteverify
 * endpoint with the secret key from env. Rejects the request with 400/403
 * if the token is missing or invalid.
 */
const turnstileMiddleware = async (req, res, next) => {
    try {
        const { turnstileToken } = req.body;

        if (!turnstileToken) {
            return res.status(400).json({ error: "Human verification is required." });
        }

        const secretKey = process.env.TURNSTILE_SECRET_KEY;
        if (!secretKey) {
            // If no secret is configured, skip verification (dev mode fallback)
            console.warn(
                "TURNSTILE_SECRET_KEY not set — skipping Turnstile verification"
            );
            return next();
        }

        // Verify the token with Cloudflare
        const formData = new URLSearchParams();
        formData.append("secret", secretKey);
        formData.append("response", turnstileToken);

        // Optionally include client IP for stricter validation
        const clientIp =
            req.header("cf-connecting-ip") ||
            req.header("x-forwarded-for")?.split(",")[0]?.trim();
        if (clientIp) {
            formData.append("remoteip", clientIp);
        }

        const verifyResponse = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            body: formData,
        });

        const outcome = await verifyResponse.json();

        if (!outcome.success) {
            console.warn("Turnstile verification failed:", outcome["error-codes"]);
            return res.status(403).json({
                error: "Human verification failed. Please try again.",
                codes: outcome["error-codes"],
            });
        }

        // Verification passed — continue to the route handler
        next();
    } catch (error) {
        console.error("Turnstile middleware error:", error);
        return res.status(500).json({
            error: "Verification processing failed. Please try again."
        });
    }
};

module.exports = { turnstileMiddleware };
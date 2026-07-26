const rateLimitStore = new Map();
const { writeAuditLog } = require('../services/audit.service');

const RATE_LIMIT_POLICIES = Object.freeze({
    auth: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 5
    },
    tokenRefresh: {
        windowMs: 15 * 60 * 1000,
        maxRequests: 20
    },
    userSearch: {
        windowMs: 60 * 1000,
        maxRequests: 30
    },
    transfer: {
        windowMs: 60 * 1000,
        maxRequests: 10
    },
    webhook: {
        windowMs: 60 * 1000,
        maxRequests: 120
    },
    adminRead: {
        windowMs: 60 * 1000,
        maxRequests: 60
    },
    adminWrite: {
        windowMs: 60 * 1000,
        maxRequests: 5
    }
});

// Feature: periodically prune expired in-memory rate-limit buckets to avoid unbounded growth.
const cleanupExpiredBuckets = () => {
    const now = Date.now();

    for (const [key, bucket] of rateLimitStore.entries()) {
        if (bucket.resetAt <= now) {
            rateLimitStore.delete(key);
        }
    }
};

// Feature: rate-limit identity prefers authenticated user IDs and falls back to IP for public routes.
const defaultKeyGenerator = (req) => {
    return req.user?._id
        ? `user:${req.user._id.toString()}`
        : `ip:${req.ip}`;
};

// Feature: named sliding-window rate limiter protects sensitive payment and auth endpoints.
const createRateLimiter = ({
    policyName,
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator
}) => {
    return (req, res, next) => {
        cleanupExpiredBuckets();

        const identity = keyGenerator(req);
        const key = `${policyName}:${identity}`;
        const now = Date.now();
        const existingBucket = rateLimitStore.get(key);
        const bucket = existingBucket && existingBucket.resetAt > now
            ? existingBucket
            : {
                count: 0,
                resetAt: now + windowMs
            };

        bucket.count += 1;
        rateLimitStore.set(key, bucket);

        const remaining = Math.max(maxRequests - bucket.count, 0);
        const resetInSeconds = Math.ceil((bucket.resetAt - now) / 1000);

        res.set('X-RateLimit-Policy', policyName);
        res.set('X-RateLimit-Limit', String(maxRequests));
        res.set('X-RateLimit-Remaining', String(remaining));
        res.set('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

        if (bucket.count > maxRequests) {
            writeAuditLog({
                req,
                action: 'rate_limit.blocked',
                resourceType: 'RateLimitPolicy',
                resourceId: policyName,
                outcome: 'blocked',
                details: {
                    policy: policyName,
                    identity,
                    limit: maxRequests,
                    windowMs,
                    retryAfterSeconds: resetInSeconds
                }
            });

            return res
                .status(429)
                .set('Retry-After', String(resetInSeconds))
                .json({
                    success: false,
                    message: "Too many requests. Please try again later.",
                    data: {
                        policy: policyName,
                        retryAfterSeconds: resetInSeconds
                    }
                });
        }

        next();
    };
};

// Feature: central rate-limit policy factory keeps route-level limits consistent and easy to audit.
const rateLimitPolicy = (policyName, overrides = {}) => {
    const policy = RATE_LIMIT_POLICIES[policyName];

    if (!policy) {
        throw new Error(`Unknown rate limit policy: ${policyName}`);
    }

    return createRateLimiter({
        policyName,
        ...policy,
        ...overrides
    });
};

module.exports = {
    RATE_LIMIT_POLICIES,
    rateLimitPolicy,
    createRateLimiter
};

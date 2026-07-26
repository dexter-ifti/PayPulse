const { buildOpenApiSpec } = require('../docs/openapi');

// Feature: derive API base URL from the current request for environment-aware OpenAPI servers.
const getRequestBaseUrl = (req) => {
    return `${req.protocol}://${req.get('host')}`;
};

// Feature: serve OpenAPI JSON for tooling, API clients, and reviewer inspection.
const getOpenApiJson = (req, res) => {
    return res.json(buildOpenApiSpec({
        baseUrl: getRequestBaseUrl(req)
    }));
};

// Feature: built-in API docs landing page works without adding Swagger UI dependencies.
const getDocsPage = (req, res) => {
    const openApiUrl = '/api/v1/docs/openapi.json';

    return res
        .type('html')
        .send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>PayPulse API Docs</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, sans-serif; background: #0f172a; color: #f8fafc; }
    main { max-width: 920px; margin: 0 auto; padding: 48px 20px; }
    h1 { font-size: 40px; margin: 0 0 12px; }
    p { color: #cbd5e1; line-height: 1.6; }
    a { color: #fb923c; font-weight: 700; }
    code { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 2px 6px; }
    section { border-top: 1px solid #334155; margin-top: 28px; padding-top: 24px; }
    li { margin: 8px 0; color: #d1d5db; }
  </style>
</head>
<body>
  <main>
    <h1>PayPulse API Docs</h1>
    <p>OpenAPI documentation for the wallet backend, including ledgering, idempotency, webhooks, retries, reconciliation, rate limiting, and audit logs.</p>
    <p>OpenAPI JSON: <a href="${openApiUrl}"><code>${openApiUrl}</code></a></p>
    <section>
      <h2>Backend Features</h2>
      <ul>
        <li>Double-entry ledger entries for wallet money movement</li>
        <li>Idempotent transfer API using <code>Idempotency-Key</code></li>
        <li>Transaction state machine with status history</li>
        <li>Signed provider webhooks with replay protection</li>
        <li>Webhook retry scheduling and dead-letter queue</li>
        <li>Reconciliation reports for ledger and provider mismatches</li>
        <li>Named rate-limit policies and append-only audit logs</li>
      </ul>
    </section>
  </main>
</body>
</html>`);
};

module.exports = {
    getOpenApiJson,
    getDocsPage
};

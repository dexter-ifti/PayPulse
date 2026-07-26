# PayPulse

PayPulse is a full-stack peer-to-peer payments app inspired by products like PayTM and Venmo. Users can create an account, sign in securely, view their wallet balance, search other users, send money, and review transaction history from a polished React dashboard.

The project is built as a portfolio-grade product demo with a modern fintech interface, cookie-based authentication, Cloudflare Turnstile bot protection, MongoDB persistence, and transaction-safe money transfers.


## Features

### User Experience

- Landing page for PayPulse with a clear product story, app preview, and calls to action.
- Signup and signin flows with inline validation, loading states, toast feedback, and password visibility controls.
- Authenticated dashboard with a sticky app bar, personalized greeting, balance card, user directory, and recent transaction history.
- Send-money flow with recipient context, amount validation, loading state, cancel action, and recovery UI when no recipient is selected.
- Responsive dark fintech UI using Tailwind CSS, gradients, glass-style surfaces, visible focus states, and reduced-motion-friendly animations.
- Toast notifications for success, error, loading, logout, and transfer feedback.

### Payments and Account Features

- New users automatically receive a starting wallet balance.
- Users can search the user directory by first or last name.
- User search supports pagination and excludes the currently signed-in user.
- Users can transfer money to another PayPulse account.
- Transfers prevent self-payment, invalid recipients, and insufficient-balance transactions.
- Transaction history shows sent and received payments with counterparty names, relative timestamps, status badges, and signed amounts.

### Authentication and Security

- Passwords are hashed with `bcrypt` before being stored.
- Authentication uses JWT access and refresh tokens.
- Tokens are sent through HTTP-only cookies instead of being exposed directly to frontend JavaScript.
- Protected backend routes use an authentication middleware that accepts cookie tokens or bearer tokens.
- Signup and signin can be protected by Cloudflare Turnstile.
- Backend validation uses `zod` for signup, signin, and profile update payloads.
- CORS is configured for credentialed frontend requests.

### Backend Reliability

- MongoDB models for users, accounts, and transactions.
- Mongoose sessions are used for signup funding and transfers so account, transaction, and ledger writes commit together.
- Every wallet money movement now writes immutable double-entry ledger rows, including signup funding and peer-to-peer transfers.
- `POST /account/transfer` requires an `Idempotency-Key` header so client retries replay the original result instead of moving money twice.
- Transactions move through an explicit state machine: `CREATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `REVERSED`, and `EXPIRED`.
- Payment-provider webhooks are verified with HMAC signatures, timestamp replay windows, unique event IDs, and durable event logs.
- Failed webhook processing is retried with backoff and moved to a dead-letter queue after repeated failure.
- Reconciliation jobs detect mismatches between cached balances, ledger-derived balances, transaction ledger rows, and provider webhook state.
- Transfers validate positive amounts before entering the transaction flow, preventing negative-amount balance corruption.
- API responses follow a consistent `success`, `message`, and `data` shape across most endpoints.
- Transaction records include sender, receiver, amount, status, and timestamps.

## Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- Axios
- React Hot Toast
- Cloudflare Turnstile via `@marsidev/react-turnstile`

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcrypt
- zod
- cookie-parser
- cors
- dotenv

## Project Structure

```text
PayPulse/
+-- backend/
|   +-- controllers/       # Route handlers for users and accounts
|   +-- middlewares/       # Auth and Turnstile middleware
|   +-- models/            # User, Account, and Transaction schemas
|   +-- routes/            # Express routers
|   +-- index.js           # Express app and MongoDB connection
|   +-- package.json
+-- frontend/
|   +-- src/
|   |   +-- components/    # Appbar, balance, users, forms, transactions
|   |   +-- pages/         # Home, Signup, Signin, Dashboard, SendMoney
|   |   +-- App.jsx        # Client routes
|   |   +-- main.jsx
|   +-- package.json
+-- DESIGN.md              # Visual design system notes
+-- PRODUCT.md             # Product positioning and UX goals
+-- Dockerfile             # MongoDB replica-set image for transactions
+-- README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB
- A MongoDB replica set for signup funding and transfer transactions to work reliably with Mongoose sessions

The included `Dockerfile` creates a MongoDB image that starts with replica-set support.

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd PayPulse

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the Backend

Create `backend/.env`:

```env
PORT=4000
DATABASE_URL=mongodb://localhost:27017/paypulse?replicaSet=rs
FRONTEND_URL=http://localhost:5173

ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-with-another-long-random-secret
REFRESH_TOKEN_EXPIRY=10d

TURNSTILE_SECRET_KEY=
WEBHOOK_SECRET=replace-with-provider-webhook-secret
NODE_ENV=development
```

`TURNSTILE_SECRET_KEY` is optional for local development. If it is missing, the backend middleware skips Turnstile verification and logs a warning.
`WEBHOOK_SECRET` is optional outside production. If it is missing locally, webhook signature verification logs the event flow but skips HMAC comparison.

### 3. Configure the Frontend

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_TURNSTILE_SITE_KEY=
```

`VITE_TURNSTILE_SITE_KEY` is optional locally. If it is not set, the Turnstile widget is not rendered.

### 4. Start MongoDB

Option A: use your own MongoDB replica set.

Option B: build and run the included MongoDB image:

```bash
docker build -t paypulse-mongo .
docker run -d --name paypulse-mongo -p 27017:27017 paypulse-mongo
```

### 5. Run the Backend

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:4000` by default.

### 6. Run the Frontend

```bash
cd frontend
npm run dev
```

The app runs on `http://localhost:5173` by default.

## Available Scripts

### Backend

```bash
npm run dev      # Start backend with nodemon
npm start        # Start backend with node
npm test         # Placeholder test script
```

### Frontend

```bash
npm run dev      # Start Vite dev server
npm run build    # Build production assets
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Overview

All application API routes are mounted under `/api/v1`.

### User Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/user/signup` | No | Create a user account and initial wallet balance |
| `POST` | `/api/v1/user/signin` | No | Sign in and set access/refresh cookies |
| `POST` | `/api/v1/user/logout` | Yes | Clear stored refresh token and auth cookies |
| `POST` | `/api/v1/user/refresh-token` | Yes | Refresh access token using refresh token |
| `GET` | `/api/v1/user/current-user` | Yes | Return the authenticated user |
| `PUT` | `/api/v1/user/` | Yes | Update password, first name, or last name |
| `GET` | `/api/v1/user/bulk` | Yes | Search users with `filter`, `page`, and `limit` query params |

### Account Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/v1/account/balance` | Yes | Return the authenticated user's balance |
| `POST` | `/api/v1/account/transfer` | Yes | Transfer money to another user |
| `GET` | `/api/v1/account/transactions` | Yes | Return sent and received transaction history |
| `GET` | `/api/v1/account/ledger` | Yes | Return immutable debit/credit ledger entries for the authenticated user |

### Webhook Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/webhooks/payments` | Signature | Receive simulated payment-provider events with replay protection |
| `GET` | `/api/v1/webhooks/events` | Yes | Inspect persisted webhook events and retry state |
| `POST` | `/api/v1/webhooks/retries/process` | Yes | Process due webhook retries in a bounded batch |
| `GET` | `/api/v1/webhooks/dead-letter` | Yes | Inspect webhook events that exceeded retry attempts |

### Reconciliation Routes

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/reconciliation/run` | Yes | Run account, ledger, transaction, and provider-event reconciliation |
| `GET` | `/api/v1/reconciliation/reports` | Yes | List reconciliation report summaries |
| `GET` | `/api/v1/reconciliation/reports/:reportId` | Yes | Fetch a detailed reconciliation report |

## Example Requests

### Signup

```http
POST /api/v1/user/signup
Content-Type: application/json

{
  "username": "aisha@example.com",
  "password": "secret123",
  "firstName": "Aisha",
  "lastName": "Khan",
  "turnstileToken": "optional-turnstile-token"
}
```

### Signin

```http
POST /api/v1/user/signin
Content-Type: application/json

{
  "username": "aisha@example.com",
  "password": "secret123",
  "turnstileToken": "optional-turnstile-token"
}
```

### Search Users

```text
GET /api/v1/user/bulk?filter=rahul&page=1&limit=5
```

### Transfer Money

```http
POST /api/v1/account/transfer
Content-Type: application/json
Idempotency-Key: 8f0f5c7e-1f6a-4d4c-97ea-f9d55d72ef80

{
  "to": "recipient-user-id",
  "amount": 500
}
```

### Payment Webhook

The signature is `HMAC_SHA256(WEBHOOK_SECRET, "{timestamp}.{raw_json_body}")` and can be sent as either the raw hex digest or `sha256=<digest>`.

```http
POST /api/v1/webhooks/payments
Content-Type: application/json
X-PayPulse-Event-Id: evt_01J5PAYPULSE001
X-PayPulse-Timestamp: <current-unix-timestamp-ms>
X-PayPulse-Signature: sha256=<hmac-sha256>

{
  "type": "PAYMENT_REVERSED",
  "data": {
    "transactionId": "<transaction-object-id>",
    "reason": "provider reversal"
  }
}
```

Supported webhook event types:

- `PAYMENT_SUCCESS`
- `PAYMENT_FAILED`
- `PAYMENT_REVERSED`
- `REFUND_PROCESSED`

## Data Models

### User

- `username`: unique email-style login
- `password`: hashed password
- `firstName`
- `lastName`
- `refreshToken`
- timestamps

### Account

- `userId`: reference to `User`
- `balance`: numeric wallet balance

### Transaction

- `type`: `opening_balance` or `transfer`
- `fromUserId`: sender user reference
- `toUserId`: receiver user reference
- `amount`
- `status`: `CREATED`, `PROCESSING`, `SUCCESS`, `FAILED`, `REVERSED`, or `EXPIRED`
- `statusHistory`: append-only transition history with reason and timestamp
- `idempotencyKey`: retry-safety key used for transfer creation
- timestamps

### Transaction State Machine

- `CREATED -> PROCESSING`
- `CREATED -> FAILED`
- `CREATED -> EXPIRED`
- `PROCESSING -> SUCCESS`
- `PROCESSING -> FAILED`
- `SUCCESS -> REVERSED`

### Ledger Entry

- `transactionId`: source transaction reference
- `accountId` / `userId`: wallet owner when the entry belongs to a user wallet
- `ledgerAccount`: stable ledger account identifier
- `entryType`: `debit` or `credit`
- `movementType`: `opening_balance` or `transfer`
- `amount`, `currency`, `balanceAfter`

### Idempotency Key

- `key`: client-provided retry key
- `userId`, `endpoint`, `requestHash`
- `status`: `processing`, `completed`, or `failed`
- `responseStatusCode` and `responseBody` for replaying duplicate requests
- `lockedUntil`, `expiresAt`

### Webhook Event

- `provider`, `eventId`, `eventType`
- `payloadHash`, `signature`, `timestampHeader`
- `status`: `received`, `processing`, `processed`, `failed`, `retry_scheduled`, `dead_lettered`, or `ignored`
- `transactionId`, `payload`
- `attempts`, `lastError`, `processedAt`, `nextRetryAt`, `deadLetteredAt`

### Dead Letter Event

- `sourceType`, `sourceId`
- `provider`, `eventId`, `eventType`
- `attempts`, `reason`, `payload`
- `resolvedAt`, `resolutionNote`

### Webhook Retry Policy

- Max attempts: `5`
- Backoff schedule: `1s`, `5s`, `30s`, `5m`, `15m`
- Due retries are processed through `POST /api/v1/webhooks/retries/process`
- Events that still fail after max attempts are copied to the dead-letter queue

### Reconciliation Report

- `status`: `completed` or `failed`
- `startedAt`, `completedAt`, `triggeredByUserId`
- `summary`: counts for accounts, transactions, webhook events, and discrepancies
- `discrepancies`: typed findings with severity, entity reference, expected value, actual value, and metadata
- `errorMessage`: populated when the reconciliation job fails

### Reconciliation Checks

- Account cached balance must equal credit-minus-debit totals from wallet ledger rows.
- Successful transactions must have ledger entries, balanced debit/credit totals, and totals matching transaction amount.
- Processed provider webhook events must point to an existing transaction whose state matches the provider event.

## Product Flow

1. A visitor lands on the PayPulse home page and chooses to sign up.
2. Signup validates the form, optionally verifies Turnstile, creates the user, and creates an account balance.
3. The user signs in, receiving HTTP-only access and refresh cookies.
4. The dashboard loads the user's balance, searchable user directory, and transaction history.
5. The user selects another user, enters an amount, and submits a transfer.
6. The backend validates the idempotency key, moves the transaction through `CREATED -> PROCESSING -> SUCCESS`, updates both balances, records ledger entries, caches the response, and returns success.
7. The user returns to the dashboard and can see the updated history.

## Design Notes

PayPulse uses a "Night Transit" design direction: a deep slate canvas with a warm orange-to-red pulse for primary actions. The interface emphasizes one clear focal action per screen, readable financial data, and familiar form patterns. More detail lives in `DESIGN.md` and `PRODUCT.md`.

## Known Notes

- The frontend keeps a small `localStorage` login flag for client-side UX, but actual authentication is handled by HTTP-only cookies.
- MongoDB transactions for signup funding and transfers require replica-set support.
- The backend test script is currently a placeholder.
- `backend/config.js` contains an older static `JWT_SECRET` export, while the active token generation and verification paths use environment variables.

----

## GitAds Sponsored

[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=dexter-ifti/paypulse@github)](https://gitads.dev/v1/ad-track?source=dexter-ifti/paypulse@github)

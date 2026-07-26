// Feature: OpenAPI contract documents the payment backend, idempotency, webhooks, retries, reconciliation, and audit APIs.
const buildOpenApiSpec = ({ baseUrl = 'http://localhost:4000' } = {}) => ({
    openapi: '3.0.3',
    info: {
        title: 'PayPulse API',
        version: '1.0.0',
        description: 'Peer-to-peer wallet API with ledgering, idempotency, webhooks, retries, reconciliation, rate limiting, and audit logging.'
    },
    servers: [
        {
            url: `${baseUrl}/api/v1`,
            description: 'Configured PayPulse API server'
        }
    ],
    tags: [
        { name: 'Users' },
        { name: 'Accounts' },
        { name: 'Webhooks' },
        { name: 'Reconciliation' },
        { name: 'Audit' },
        { name: 'Docs' }
    ],
    components: {
        securitySchemes: {
            cookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'accessToken'
            },
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
            webhookSignature: {
                type: 'apiKey',
                in: 'header',
                name: 'X-PayPulse-Signature'
            },
            idempotencyKey: {
                type: 'apiKey',
                in: 'header',
                name: 'Idempotency-Key'
            }
        },
        parameters: {
            Page: {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', minimum: 1, default: 1 }
            },
            Limit: {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
            }
        },
        schemas: {
            ApiError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    errors: { type: 'array', items: { type: 'object' } }
                }
            },
            Pagination: {
                type: 'object',
                properties: {
                    currentPage: { type: 'integer' },
                    totalPages: { type: 'integer' },
                    limit: { type: 'integer' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    username: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                }
            },
            TransactionState: {
                type: 'string',
                enum: ['CREATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED', 'EXPIRED']
            },
            TransactionHistoryItem: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    amount: { type: 'number' },
                    status: { $ref: '#/components/schemas/TransactionState' },
                    statusHistory: {
                        type: 'array',
                        items: { type: 'object' }
                    },
                    timestamp: { type: 'string', format: 'date-time' },
                    type: { type: 'string', enum: ['sent', 'received'] },
                    counterparty: {
                        type: 'object',
                        properties: {
                            firstName: { type: 'string' },
                            lastName: { type: 'string' }
                        }
                    }
                }
            },
            LedgerEntry: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    transactionId: { type: 'string' },
                    accountId: { type: 'string' },
                    userId: { type: 'string' },
                    ledgerAccount: { type: 'string' },
                    entryType: { type: 'string', enum: ['debit', 'credit'] },
                    movementType: { type: 'string', enum: ['opening_balance', 'transfer'] },
                    amount: { type: 'number' },
                    currency: { type: 'string', example: 'INR' },
                    balanceAfter: { type: 'number' }
                }
            },
            WebhookEvent: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    provider: { type: 'string' },
                    eventId: { type: 'string' },
                    eventType: { type: 'string' },
                    status: {
                        type: 'string',
                        enum: ['received', 'processing', 'processed', 'failed', 'retry_scheduled', 'dead_lettered', 'ignored']
                    },
                    attempts: { type: 'integer' },
                    nextRetryAt: { type: 'string', format: 'date-time' },
                    lastError: { type: 'string' }
                }
            },
            ReconciliationReport: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    status: { type: 'string', enum: ['completed', 'failed'] },
                    summary: {
                        type: 'object',
                        properties: {
                            accountsChecked: { type: 'integer' },
                            transactionsChecked: { type: 'integer' },
                            webhookEventsChecked: { type: 'integer' },
                            discrepanciesFound: { type: 'integer' }
                        }
                    },
                    discrepancies: {
                        type: 'array',
                        items: { type: 'object' }
                    }
                }
            },
            AuditLog: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    actorUserId: { type: 'string' },
                    actorType: { type: 'string', enum: ['user', 'system', 'provider', 'anonymous'] },
                    action: { type: 'string' },
                    resourceType: { type: 'string' },
                    resourceId: { type: 'string' },
                    outcome: { type: 'string', enum: ['success', 'failure', 'blocked'] },
                    details: { type: 'object' },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: 'Authentication required or invalid token',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' }
                    }
                }
            },
            TooManyRequests: {
                description: 'Rate limit exceeded',
                headers: {
                    'Retry-After': { schema: { type: 'integer' } },
                    'X-RateLimit-Policy': { schema: { type: 'string' } },
                    'X-RateLimit-Limit': { schema: { type: 'integer' } },
                    'X-RateLimit-Remaining': { schema: { type: 'integer' } },
                    'X-RateLimit-Reset': { schema: { type: 'integer' } }
                },
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ApiError' }
                    }
                }
            }
        }
    },
    paths: {
        '/user/signup': {
            post: {
                tags: ['Users'],
                summary: 'Create user and fund opening wallet balance',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password', 'firstName', 'lastName'],
                                properties: {
                                    username: { type: 'string', format: 'email' },
                                    password: { type: 'string', minLength: 5 },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    turnstileToken: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'User created successfully' },
                    400: { description: 'Invalid input' },
                    409: { description: 'Email already taken' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/user/signin': {
            post: {
                tags: ['Users'],
                summary: 'Sign in and set HTTP-only auth cookies',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string', format: 'email' },
                                    password: { type: 'string' },
                                    turnstileToken: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'User signed in successfully' },
                    401: { description: 'Incorrect credentials' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/user/logout': {
            post: {
                tags: ['Users'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Clear refresh token and auth cookies',
                responses: {
                    200: { description: 'User logged out successfully' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/user/refresh-token': {
            post: {
                tags: ['Users'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Refresh the access token',
                responses: {
                    200: { description: 'Access token refreshed successfully' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/user/current-user': {
            get: {
                tags: ['Users'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Return authenticated user',
                responses: {
                    200: { description: 'Authenticated user' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/user/bulk': {
            get: {
                tags: ['Users'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Search users',
                parameters: [
                    { name: 'filter', in: 'query', schema: { type: 'string' } },
                    { $ref: '#/components/parameters/Page' },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 5 } }
                ],
                responses: {
                    200: { description: 'Paginated users' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/account/balance': {
            get: {
                tags: ['Accounts'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Return wallet balance',
                responses: {
                    200: { description: 'Wallet balance' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/account/transfer': {
            post: {
                tags: ['Accounts'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }, { idempotencyKey: [] }],
                summary: 'Transfer money idempotently',
                parameters: [
                    {
                        name: 'Idempotency-Key',
                        in: 'header',
                        required: true,
                        schema: { type: 'string', minLength: 8, maxLength: 128 }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['to', 'amount'],
                                properties: {
                                    to: { type: 'string', description: 'Recipient user id' },
                                    amount: { type: 'number', minimum: 0, exclusiveMinimum: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Transfer successful or replayed response' },
                    400: { description: 'Invalid transfer' },
                    409: { description: 'Idempotency conflict or in-flight request' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/account/transactions': {
            get: {
                tags: ['Accounts'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Return transfer history',
                responses: {
                    200: {
                        description: 'Transfer history',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean' },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                transactions: {
                                                    type: 'array',
                                                    items: { $ref: '#/components/schemas/TransactionHistoryItem' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/account/ledger': {
            get: {
                tags: ['Accounts'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Return immutable ledger entries',
                parameters: [{ $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
                responses: {
                    200: { description: 'Ledger history' }
                }
            }
        },
        '/webhooks/payments': {
            post: {
                tags: ['Webhooks'],
                security: [{ webhookSignature: [] }],
                summary: 'Receive simulated provider payment webhook',
                parameters: [
                    { name: 'X-PayPulse-Event-Id', in: 'header', required: true, schema: { type: 'string' } },
                    { name: 'X-PayPulse-Timestamp', in: 'header', required: true, schema: { type: 'string' } },
                    { name: 'X-PayPulse-Signature', in: 'header', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['type', 'data'],
                                properties: {
                                    type: {
                                        type: 'string',
                                        enum: ['PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_REVERSED', 'REFUND_PROCESSED']
                                    },
                                    data: {
                                        type: 'object',
                                        required: ['transactionId'],
                                        properties: {
                                            transactionId: { type: 'string' },
                                            reason: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Webhook accepted or replayed' },
                    401: { description: 'Invalid webhook signature' },
                    409: { description: 'Event ID reused with different payload' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/webhooks/events': {
            get: {
                tags: ['Webhooks'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'List persisted webhook events',
                parameters: [
                    { name: 'status', in: 'query', schema: { type: 'string' } },
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' }
                ],
                responses: { 200: { description: 'Webhook events' } }
            }
        },
        '/webhooks/retries/process': {
            post: {
                tags: ['Webhooks'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Process due webhook retries',
                responses: {
                    200: { description: 'Due retries processed' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/webhooks/dead-letter': {
            get: {
                tags: ['Webhooks'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'List dead-letter webhook events',
                parameters: [{ $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
                responses: { 200: { description: 'Dead-letter events' } }
            }
        },
        '/reconciliation/run': {
            post: {
                tags: ['Reconciliation'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Run reconciliation job',
                responses: {
                    201: { description: 'Reconciliation report created' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/reconciliation/reports': {
            get: {
                tags: ['Reconciliation'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'List reconciliation reports',
                parameters: [{ $ref: '#/components/parameters/Page' }, { $ref: '#/components/parameters/Limit' }],
                responses: { 200: { description: 'Reconciliation report summaries' } }
            }
        },
        '/reconciliation/reports/{reportId}': {
            get: {
                tags: ['Reconciliation'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'Fetch detailed reconciliation report',
                parameters: [
                    { name: 'reportId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detailed reconciliation report' },
                    404: { description: 'Report not found' }
                }
            }
        },
        '/audit/logs': {
            get: {
                tags: ['Audit'],
                security: [{ cookieAuth: [] }, { bearerAuth: [] }],
                summary: 'List audit logs',
                parameters: [
                    { name: 'action', in: 'query', schema: { type: 'string' } },
                    { name: 'outcome', in: 'query', schema: { type: 'string', enum: ['success', 'failure', 'blocked'] } },
                    { name: 'actorUserId', in: 'query', schema: { type: 'string' } },
                    { name: 'resourceType', in: 'query', schema: { type: 'string' } },
                    { name: 'resourceId', in: 'query', schema: { type: 'string' } },
                    { $ref: '#/components/parameters/Page' },
                    { $ref: '#/components/parameters/Limit' }
                ],
                responses: {
                    200: { description: 'Audit logs' },
                    429: { $ref: '#/components/responses/TooManyRequests' }
                }
            }
        },
        '/docs/openapi.json': {
            get: {
                tags: ['Docs'],
                summary: 'Return OpenAPI JSON document',
                responses: {
                    200: { description: 'OpenAPI document' }
                }
            }
        }
    }
});

module.exports = { buildOpenApiSpec };

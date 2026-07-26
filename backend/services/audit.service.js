const { AuditLog } = require('../models/auditLog.model');

// Feature: request metadata capture gives audit entries enough context for incident review.
const getRequestAuditContext = (req) => {
    return {
        actorUserId: req.user?._id,
        actorType: req.user?._id ? 'user' : 'anonymous',
        ipAddress: req.ip,
        userAgent: req.get?.('User-Agent'),
        requestId: req.get?.('X-Request-Id')
    };
};

// Feature: audit writes are isolated from business flows so logging failures do not break payments.
const writeAuditLog = async ({
    req,
    actorUserId,
    actorType,
    action,
    resourceType,
    resourceId,
    outcome,
    details = {},
    session
}) => {
    try {
        const requestContext = req ? getRequestAuditContext(req) : {};
        const [auditLog] = await AuditLog.create([{
            ...requestContext,
            actorUserId: actorUserId || requestContext.actorUserId,
            actorType: actorType || requestContext.actorType || 'system',
            action,
            resourceType,
            resourceId: resourceId?.toString(),
            outcome,
            details
        }], session ? { session } : undefined);

        return auditLog;
    } catch (error) {
        console.error("Audit log write failed:", error);
        return null;
    }
};

module.exports = {
    getRequestAuditContext,
    writeAuditLog
};

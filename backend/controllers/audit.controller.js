const { AuditLog } = require('../models/auditLog.model');

// Feature: inspect audit logs with filters for action, outcome, actor, and resource.
const listAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;
        const query = {};

        if (req.query.action) {
            query.action = req.query.action;
        }

        if (req.query.outcome) {
            query.outcome = req.query.outcome;
        }

        if (req.query.actorUserId) {
            query.actorUserId = req.query.actorUserId;
        }

        if (req.query.resourceType) {
            query.resourceType = req.query.resourceType;
        }

        if (req.query.resourceId) {
            query.resourceId = req.query.resourceId;
        }

        const [logs, totalLogs] = await Promise.all([
            AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            AuditLog.countDocuments(query)
        ]);

        return res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalLogs / limit),
                    totalLogs,
                    limit
                }
            }
        });
    } catch (error) {
        console.error("Error listing audit logs:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    listAuditLogs
};

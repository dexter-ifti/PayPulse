const { mongoose } = require('mongoose');
const { ReconciliationReport } = require('../models/reconciliationReport.model');
const { runReconciliation } = require('../services/reconciliation.service');
const { writeAuditLog } = require('../services/audit.service');

// Feature: run a reconciliation job that checks ledger balances, transaction ledger rows, and provider webhook state.
const runReconciliationReport = async (req, res) => {
    try {
        const report = await runReconciliation({
            triggeredByUserId: req.user?._id
        });

        await writeAuditLog({
            req,
            action: 'reconciliation.run',
            resourceType: 'ReconciliationReport',
            resourceId: report._id,
            outcome: report.status === 'completed' ? 'success' : 'failure',
            details: {
                status: report.status,
                summary: report.summary,
                errorMessage: report.errorMessage
            }
        });

        return res.status(report.status === 'completed' ? 201 : 500).json({
            success: report.status === 'completed',
            message: report.status === 'completed'
                ? "Reconciliation completed"
                : "Reconciliation failed",
            data: {
                report
            }
        });
    } catch (error) {
        console.error("Error running reconciliation:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: list past reconciliation reports for trend and audit review.
const listReconciliationReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const skip = (page - 1) * limit;

        const [reports, totalReports] = await Promise.all([
            ReconciliationReport.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-discrepancies'),
            ReconciliationReport.countDocuments()
        ]);

        return res.json({
            success: true,
            data: {
                reports,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalReports / limit),
                    totalReports,
                    limit
                }
            }
        });
    } catch (error) {
        console.error("Error listing reconciliation reports:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Feature: fetch a detailed reconciliation report including every detected discrepancy.
const getReconciliationReport = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.reportId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reconciliation report id"
            });
        }

        const report = await ReconciliationReport.findById(req.params.reportId);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Reconciliation report not found"
            });
        }

        return res.json({
            success: true,
            data: {
                report
            }
        });
    } catch (error) {
        console.error("Error fetching reconciliation report:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    runReconciliationReport,
    listReconciliationReports,
    getReconciliationReport
};

const { User } = require('../models/user.model');
const { Account } = require('../models/account.model');
const { Transaction } = require('../models/transaction.model');
const { createOpeningBalanceLedgerEntries } = require('../services/ledger.service');
const {
    TRANSACTION_STATES,
    transitionTransactionState
} = require('../services/transactionState.service');
const { writeAuditLog } = require('../services/audit.service');
const { mongoose } = require('mongoose');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Validation schemas
const signupSchema = z.object({
    username: z.string().min(3).email(),
    password: z.string().min(5),
    firstName: z.string().min(3),
    lastName: z.string().min(3)
});

const signinSchema = z.object({
    username: z.string().min(3).email(),
    password: z.string().min(5)
});

const updateSchema = z.object({
    password: z.string().min(5).optional(),
    firstName: z.string().min(3).optional(),
    lastName: z.string().min(3).optional()
});

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Controller functions
const signup = async (req, res) => {
    const session = await mongoose.startSession();
    let transactionStarted = false;

    try {
        const { username, password, firstName, lastName } = req.body;

        const parsed = signupSchema.safeParse({
            username,
            password,
            firstName,
            lastName,
        });

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid input data",
                errors: parsed.error.errors,
            });
        }

        const existingUser = await User.findOne({
            username
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already taken"
            });
        }

        session.startTransaction();
        transactionStarted = true;

        const [user] = await User.create([{
            username,
            password,
            firstName,
            lastName
        }], { session });

        const userId = user._id;
        const openingBalance = 1 + Math.floor(Math.random() * 10000000);

        const [account] = await Account.create([{
            userId,
            balance: openingBalance
        }], { session });

        // Feature: signup now records the starter wallet balance as balanced ledger entries.
        const [openingTransaction] = await Transaction.create([{
            type: 'opening_balance',
            toUserId: userId,
            amount: openingBalance,
            status: TRANSACTION_STATES.CREATED
        }], { session });

        await transitionTransactionState({
            transaction: openingTransaction,
            toState: TRANSACTION_STATES.PROCESSING,
            reason: 'Opening wallet funding started',
            session
        });

        await createOpeningBalanceLedgerEntries({
            transactionId: openingTransaction._id,
            account,
            amount: openingBalance,
            session
        });

        await transitionTransactionState({
            transaction: openingTransaction,
            toState: TRANSACTION_STATES.SUCCESS,
            reason: 'Opening wallet funding ledger posted',
            session
        });

        await writeAuditLog({
            req,
            actorUserId: userId,
            actorType: 'user',
            action: 'user.signup',
            resourceType: 'User',
            resourceId: userId,
            outcome: 'success',
            details: {
                openingBalance,
                openingTransactionId: openingTransaction._id
            },
            session
        });

        await session.commitTransaction();
        transactionStarted = false;
        res.json({
            success: true,
            message: "User created successfully"
        });
    } catch (error) {
        if (transactionStarted) {
            await session.abortTransaction();
        }
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    } finally {
        session.endSession();
    }
};

const signin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const parsed = signinSchema.safeParse({ username, password });

        if (!parsed.success) {
            return res.status(400).json({
                success: false,
                message: "Incorrect inputs",
                errors: parsed.error.errors
            });
        }

        const user = await User.findOne({ username });

        if (!user) {
            await writeAuditLog({
                req,
                actorType: 'anonymous',
                action: 'user.signin',
                resourceType: 'User',
                outcome: 'failure',
                details: {
                    username,
                    reason: 'user_not_found'
                }
            });

            return res.status(404).json({
                success: false,
                message: "Incorrect user credentials"
            });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);

        if (!isPasswordValid) {
            await writeAuditLog({
                req,
                actorUserId: user._id,
                actorType: 'user',
                action: 'user.signin',
                resourceType: 'User',
                resourceId: user._id,
                outcome: 'failure',
                details: {
                    reason: 'invalid_password'
                }
            });

            return res.status(401).json({
                success: false,
                message: "Incorrect user credentials"
            });
        }

        const userId = user._id;
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(userId);

        const loggedInUser = await User.findById(userId).select(
            "-password -refreshToken"
        )

        await writeAuditLog({
            req,
            actorUserId: userId,
            actorType: 'user',
            action: 'user.signin',
            resourceType: 'User',
            resourceId: userId,
            outcome: 'success'
        });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        }



        res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
                success: true,
                message: "User signed in successfully",
                data: {
                    user: loggedInUser
                }
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
};


const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        await writeAuditLog({
            req,
            actorUserId: userId,
            actorType: 'user',
            action: 'user.logout',
            resourceType: 'User',
            resourceId: userId,
            outcome: 'success'
        });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                success: true,
                message: "User logged out successfully"
            })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        return res
            .status(401)
            .json({
                success: false,
                message: "Unauthorized"
            })
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Invalid refresh token"
                })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(401)
                .json({
                    success: false,
                    message: "Refresh token is expired or invalid"
                })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({
                success: true,
                message: "Access token refreshed successfully"
            })
    } catch (error) {
        return res
            .status(500)
            .json({
                success: false,
                message: "Something went wrong"
            })
    }
}


const updateUser = async (req, res) => {
    try {
        const success = updateSchema.safeParse(req.body);

        if (!success.success) {
            return res.status(400).json({
                success: false,
                message: "Incorrect inputs",
                errors: success.error.errors
            });
        }

        await User.updateOne({
            _id: req.user._id
        }, req.body);

        res.status(200).json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
};

const bulkSearch = async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        // Build query to exclude current user if authenticated
        const query = {
            $or: [{
                firstName: {
                    "$regex": filter,
                    "$options": "i"  // case-insensitive search
                }
            }, {
                lastName: {
                    "$regex": filter,
                    "$options": "i"
                }
            }]
        };

        // Exclude current user if authenticated
        if (req.user && req.user._id) {
            query._id = { $ne: req.user._id };
        }

        // Get total count for pagination
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        // Get paginated users
        const users = await User.find(query)
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            data: {
                users: users.map(user => ({
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    _id: user._id
                })),
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalUsers: totalUsers,
                    limit: limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
};

const getCurrentUser = async (req, res) => {
    try {
        return res
            .status(200)
            .json({
                success: true,
                data: {
                    user: req.user
                }
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        })
    }
}

module.exports = {
    signup,
    signin,
    refreshAccessToken,
    logoutUser,
    updateUser,
    bulkSearch,
    getCurrentUser
};

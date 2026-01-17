const { User } = require('../models/user.model');
const { Account } = require('../models/account.model');
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
    const { username, password, firstName, lastName } = req.body;

    const parsed = signupSchema.safeParse({
        username,
        password,
        firstName,
        lastName,
    });

    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input data",
            errors: parsed.error.errors,
        });
    }

    const existingUser = await User.findOne({
        username
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Email already taken"
        });
    }

    const user = await User.create({
        username,
        password,
        firstName,
        lastName
    });

    const userId = user._id;
    const createdUser = await User.findById(userId).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(500).json({
            message: "Something went wrong"
        })
    }


    await Account.create({
        userId,
        balance: 1 + Math.floor(Math.random() * 10000000)
    });


    res.json({
        message: "User created successfully"
    });
};

const signin = async (req, res) => {
    const { username, password } = req.body;

    const parsed = signinSchema.safeParse({ username, password });

    if (!parsed.success) {
        return res.status(411).json({
            message: "User not found"
        });
    }

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Incorrect user credentials"
        });
    }

    const userId = user._id;
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(userId);

    const loggedInUser = await User.findById(userId).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }



    res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            message: "User signed in successfully",
            user: loggedInUser, accessToken, refreshToken
        });
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

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json({
                message: "User logged out successfully"
            })
    } catch (error) {
        return res.status(500).json({
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
                    message: "Invalid refresh token"
                })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res
                .status(401)
                .json({
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
                message: "Access token refreshed successfully",
                accessToken,
                refreshToken: newRefreshToken
            })
    } catch (error) {
        return res
            .status(500)
            .json({
                message: "Something went wrong"
            })
    }
}


const updateUser = async (req, res) => {
    const success = updateSchema.safeParse(req.body);

    if (!success.success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }

    await User.updateOne({
        _id: req.userId
    }, req.body);

    res.status(200).json({
        message: "User updated successfully"
    });
};

const bulkSearch = async (req, res) => {
    const filter = req.query.filter || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
        user: users.map(user => ({
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
    });
};

const getCurrentUser = async (req, res) => {
    return res
        .status(200)
        .json({
            user: req.user
        });
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

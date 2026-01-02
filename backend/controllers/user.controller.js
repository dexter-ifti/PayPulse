const { User, Account } = require('../models');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

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

// Controller functions
const signup = async (req, res) => {
    const { username, password, firstName, lastName } = req.body;
    const success = signupSchema.safeParse({ username, password, firstName, lastName });

    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        });
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(409).json({
            message: "Email already taken"
        });
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    });

    const userId = user._id;

    await Account.create({
        userId,
        balance: 1 + Math.floor(Math.random() * 10000000)
    });

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token
    });
};

const signin = async (req, res) => {
    const { username, password } = req.body;

    const success = signinSchema.safeParse({ username, password });

    if (!success) {
        return res.status(411).json({
            message: "User not found"
        });
    }

    const user = await User.findOne({
        username,
        password
    });

    if (!user) {
        return res.status(411).json({
            message: "User not found"
        });
    }

    const userId = user._id;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User signed in successfully",
        token: token,
        firstName: user.firstName
    });
};

const updateUser = async (req, res) => {
    const success = updateSchema.safeParse(req.body);

    if (!success) {
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
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    });

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
};

module.exports = {
    signup,
    signin,
    updateUser,
    bulkSearch
};

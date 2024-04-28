const express = require('express');
const zod = require('zod');
const { JWT_SECRET } = require('../config');
const { User, Account } = require('../db');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware');

const signup_schema = zod.object({
    username: zod.string().email(),
    firstname: zod.string().max(50),
    lastname: zod.string().max(50),
    password: zod.string().min(6)
});


const router = express.Router();

router.post('/signup', async (req, res) => {

    const response = signup_schema.safeParse(req.body);
    if (!response.success) {
        res.status(411).send({
            message: "Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        res.status(411).send({
            message: "Email already taken"
        });
    }
    const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: req.body.password
    });

    const userId = user._id;

    await Account.create({
        userId,
        balance : Math.floor(Math.random() * 100000 + 1)
    })


    const token = jwt.sign({
        userId : user._id
    }, JWT_SECRET);

    
    res.status(200).send({
        message: 'User created successfully',
        token: token
    });
});


const signin_schema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6)
});

router.post('/signin', async (req, res) => {
    const response = signin_schema.safeParse(req.body);
    if (!response.success) {
        res.status(411).send({
            message: "Incorrect inputs"
        });
    }
    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });
    if (!user) {
        res.status(411).send({
            message: "Error while logging in"
        });
    } else {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        res.status(200).send({
            message: 'User signed in successfully',
            token: token
        });
    }
})

const update_schema = zod.object({
    firstname: zod.string().max(50).optional(),
    lastname: zod.string().max(50).optional(),
    password: zod.string().min(6).optional()
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body, {
        id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })
})


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstname: {
                "$regex": filter
            }
        }, {
            lastname: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})




module.exports = router;
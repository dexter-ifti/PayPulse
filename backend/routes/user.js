const express = require('express');
const {User, Account} = require('../db');
const {z} = require('zod');
const router = express.Router();
const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config')
const {authMiddleware} = require('../middleware');


const signupSchema = z.object({
    username : z.string().min(3).email(),
    password : z.string().min(5),
    firstName : z.string().min(3),
    lastName : z.string().min(3)
})

const signinSchema = z.object({
    username : z.string().min(3).email(),
    password : z.string().min(5)
})

router.post('/signup', async (req, res) => {
    const {username, password, firstName, lastName} = req.body;
        const success = signupSchema.safeParse({username, password, firstName, lastName});
        if(!success){
            success.status(411).json({
                message: "Email already taken / Incorrect inputs"
            })
        }

        const existingUser = await User.findOne({
            username : req.body.username
        })

        if(existingUser){
            res.status(409).json({
                message: "Email already taken"
            })
        }

        const user = await User.create({
            username : req.body.username,
            password : req.body.password,
            firstName : req.body.firstName,
            lastName : req.body.lastName
        })

        const userId = user._id;


        await Account.create({
            userId, 
            balance: 1 + Math.floor(Math.random() * 10000000)
        })

        const token = jwt.sign({
            userId
        }, JWT_SECRET);

        res.json({
            message: "User created successfully",
            token
        })
})


router.post('/signin', async (req, res) => {
    const {username, password} = req.body;

    const success = signinSchema.safeParse({username, password});
    
    if(!success){
        success.status(411).json({
            message: "User not found"
        })
    } 
    
    const user = await User.findOne({
        username,
        password
    })

    if(!user){
        alert("User not found")
        res.status(411).json({
            message: "User not found"
        })
    }
    else {
        const userId = user._id;
        const token = jwt.sign({
            userId
        }, JWT_SECRET);
        res.json({
            message: "User signed in successfully",
            token : token
        })
    }

    // res.status(200).json({
    //     message: "User signed in successfully",
    //     token : token
    // })
})


const updateSchema = z.object({
    password : z.string().min(5).optional(),
    firstName : z.string().min(3).optional(),
    lastName : z.string().min(3).optional()
})

router.put('/', authMiddleware, async (req, res) => {
    const success = updateSchema.safeParse(req.body);

    if(!success){
        success.status(411).json({
            message: "Incorrect inputs"
        })
    }
    await User.updateOne({
        _id : req.userId
    }, req.body)

    res.status(200).json({
        message: "User updated successfully"
    })
})

router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or : [{
            firstName : {
                "$regex" : filter
            }
        }, {
            lastName : {
                "$regex" : filter
            
            }
        }]
    })

    res.json({
        user : users.map(user => ({
            username : user.username,
            firstName : user.firstName,
            lastName : user.lastName,
            _id : user._id
        }))
    })
})




module.exports = router;
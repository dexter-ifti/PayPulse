const express = require('express');
const { Account } = require('../db');
const { default: mongoose } = require('mongoose');
const authMiddleware = require('../middleware');
const router = express.Router();



router.get('/balance', authMiddleware ,async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.status(200).json({
        balance: account.balance
    });
})


// wihout the use Transaction in DB

// router.post('/transfer', authMiddleware,  async (req, res) => {
//     const {to, amount} = req.body;
//     const account = await Account.findOne({
//         userId: req.userId
//     });

//     if(account.balance < amount) {
//         res.status(400).json({
//             message: 'Insufficient balance'
//         });
//     }

//     const toAccount = await Account.findOne({
//         userId: to
//     });

//     if(!toAccount) {
//         res.status(404).json({
//             message: 'Account not found'
//         });
//     }

//     await Account.updateOne({
//         userId: req.userId
//     }, {
//         $inc: {
//             balance: -amount
//         }
//     });

//     await Account.updateOne({
//         userId: to
//     }, {
//         $inc: {
//             balance: amount
//         }
//     });

//     res.status(200).json({
//         message: 'Transfer successful'
//     });
// });

// with the use of Transaction in DB

router.post('/transfer', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    
    
    session.startTransaction();

    const {amount, to} = req.body;


    // check if the user has enough balance   
    const account = await Account.findOne({
        userId: req.userId
    }).session(session);

    if(!account || account.balance < amount) {
        await session.abortTransaction();
        return res.status(400).json({
            message: 'Insufficient balance'
        });
    }

    const toAccount = await Account.findOne({
        userId: to
    }).session(session);

    if(!toAccount) {
        await session.abortTransaction();
        return res.status(404).json({
            message: 'Account not found'
        });
    }


    // update the balance
    await Account.updateOne({userId : req.userId}, {$inc : {balance: -amount}}).session(session);
    await Account.updateOne({userId : to}, {$inc : {balance: amount}}).session(session);


    // commit the transaction
    await session.commitTransaction();

    res.json({
        message: 'Transfer successful'
    });
})

// transfer ({
// userId: "65ac44e10ab2ec750ca666a5",
//     body : {
//         to: "65ac44e40ab2ec750ca666aa",
//         amount: 100
//     }
// })

// transfer ({
// userId: "65ac44e10ab2ec750ca666a5",
//     body : {
//         to: "65ac44e40ab2ec750ca666aa",
//         amount: 100
//     }
// })

module.exports = router; 
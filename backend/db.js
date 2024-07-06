const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('Connected to MongoDB'))
.catch( err => console.log('Failed to connect to MongoDB', err));

const userShcema = mongoose.Schema({
    username: {
        type : String,
        required : true,
        unique : true,
        trim : true,
        minLength : 3
    },
    password: {
        type : String,
        required : true,
        trim : true,
        minLength : 3
    },
    firstName : {
        type : String,
        required : true,
        trim : true,
        minLength : 3
    }, 
    lastName : {
        type : String,
        required : true,
        trim : true,
        minLength : 3
    },
});

const User = mongoose.model('User', userShcema);


const accountSchema = mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    },
    balance : {
        type : Number,
        required : true
    }
})

const Account = mongoose.model('Account', accountSchema);

module.exports = {User, Account};
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://dexter_ifti:67XnVWNvgjMo963f@cluster0.o0es3zy.mongodb.net/pay');


const schema = new mongoose.Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        lowercase: true
    },
    firstname : {
        type : String,
        required : true,
        trim : true,
        maxlength: 50
    },
        
    lastname: {
        type: String,
        required: true,
        trim : true,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }
});

const acc_schema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required: true,
    },
    balance: {
        type: Number,
        required: true
    }
})


const User = mongoose.model('User', schema);

const Account = mongoose.model('Account', acc_schema);


module.exports = {
    User,
    Account
};
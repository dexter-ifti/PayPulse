const mongoose = require('mongoose');

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

module.exports = {User};
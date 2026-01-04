const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const userSchema = mongoose.Schema({
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
    refreshToken : {
        type : String,
        default : ""
    }
}, {
    timestamps : true
});

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return ;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
const User = mongoose.model('User', userSchema);

module.exports = {User};
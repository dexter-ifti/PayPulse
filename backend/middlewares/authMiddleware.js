const jwt = require('jsonwebtoken');
const {User} = require('../models/user.model');
require('dotenv').config();

async function authMiddleware(req, res, next){
    try {
        const token = req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ", "");

        if(!token){
            return res.status(401).json({message: "Unauthorized"});
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            return res.status(401).json({message: "Invalid Access Token"});
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: error?.message || "Invalid Access Token"});
    }
};


module.exports = {authMiddleware};
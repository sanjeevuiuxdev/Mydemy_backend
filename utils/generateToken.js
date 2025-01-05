const JWT = require('jsonwebtoken')
// const dotenv = require("dotenv") 

const generateToken = async (res,user,message) => {
    const token = JWT.sign({userId:user._id},process.env.JWT_SECRET,{expiresIn:'7d'})
    res.status(200).send({success:true,message,token,user})
}

module.exports = {generateToken}
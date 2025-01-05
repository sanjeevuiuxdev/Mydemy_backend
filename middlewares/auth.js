
const JWT = require("jsonwebtoken")

const userAuth = async (req,res,next) => {
    const {token} = req.headers
    if(!token){
        return res.status(400).send({success:false,message:"User not authorized please login"})
    }
    try {
        const token_decode = JWT.verify(token,process.env.JWT_SECRET)
        req.userId = token_decode?.userId
        next()
    } catch (error) {
        console.log(error);
        res.status(400).send({success:false,message:error.message,error})
    }
}

module.exports = {userAuth}
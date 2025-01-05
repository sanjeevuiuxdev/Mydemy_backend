
const JWT = require("jsonwebtoken")

const adminAuth = async (req,res,next) => {
    try {
        const {token} = req?.headers
        if(!token){
            return res.status(500).send({success:false,message:"Untoraized user"})
         }
         const token_decode = JWT.verify(token,process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
           return res.status(500).send({success:false,message:"Untoraized user"})
        }
        next()
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false,message:"something wrong when admin login",error})
    }
}


module.exports = {adminAuth}
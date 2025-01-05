const userModel = require("../models/userModel")
const bcrypt = require('bcryptjs');
var JWT = require('jsonwebtoken');
const { generateToken } = require("../utils/generateToken");
const { deleteMediaFromCloudinary, uploadMedia } = require("../utils/cloudinary");


// admin login

const adminLogin = async (req,res) => {
    try {
        const {email,password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = JWT.sign(email+password,process.env.JWT_SECRET)
            res.status(200).send({success:true, message:"admin login Successfully",token})
        }else{
            res.status(200).send({success:false, message:"invalid credentials"})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({success:false, message:"Something is wrong when admin login",error})
    }
}

const registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body
        if(!name || !email || !password){
            return res.status(400).send({success:false,message:"All fields required"})
        }

        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).send({success:false,message:"User Already Registered Please Login"})

        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password,saltRounds)
        const user = await new userModel({name,email,password:hashedPassword}).save()
        return res.status(200).send({success:true,message:"Register Successfully",user})
    } catch (error) {
        console.log(error,"while register account");
        return res.status(400).send({success:false,message:"Error while Register",error})
    }
}

const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body

        // check all field is fill or not
        if(!email || !password){
            return res.status(400).send({success:false,message:"Please Enter email and password"})
        }

        // check user exisite or not
        const user = await userModel.findOne({email})
        if(!user){
            return res.status(400).send({success:false,message:"User not exisit please register your account"})
        }
        
        // compare password
        const comparePassword = await bcrypt.compare(password,user.password)
        if(comparePassword){
            generateToken(res,user,`Welcome Back ${user.name}`)
            return;
        }else{
            res.status(400).send({success:false,message:"Invalid email or password"})
        }
    } catch (error) {
        console.log(error,"error while login account");
        return res.status(400).send({success:false,message:"Error while login account",error})
    }
}

const getUserProfile = async (req,res) => {
    try {
        const userId = req.userId //req.body.userId yai auth.js m sai aa rha h kyuki humnai token_decode.userId ko req.body.userId iss variable m save kiya h
        const user = await userModel.findById(userId).select("-password")
        return res.status(200).send({success:true,message:"get user details",user})
    } catch (error) {
        return res.status(400).send({success:false,message:"Error while get user details",error})
    }
}

const updateProfile = async (req,res) => {
    try {

        // console.log("File:", req.file); // Logs file data
        // console.log("Body:", req.body); // Logs text fields 

        const userId = req?.userId;
        const {name} = req?.body;
        const profilePhoto = req?.file

        if (!userId || !name) {
            return res.status(400).send({ success: false, message: "Invalid input data" });
        }

        const user = await userModel.findById(userId)
        if(!user){
            return res.status(400).send({success:false,message:"User not found"})
        }
        // extract public id of the old image from the url is it exists
        if(user.photoUrl){
            const publicId = user?.photoUrl.split('/').pop().split('.')[0] //extract public id
            try {
                await deleteMediaFromCloudinary(publicId);
            } catch (err) {
                console.error("Error deleting old photo:", err);
            }
        }

        // upload new photo
        const cloudResponse = await uploadMedia(profilePhoto?.path)
        const photoUrl = cloudResponse?.secure_url;

        const updatedData = {name,photoUrl}
        const updatedUser = await userModel.findByIdAndUpdate(userId,updatedData,{new:true}).select("-password")
        return res.status(200).send({success:true,message:"Profile updated successfully",updatedUser})
    } catch (error) {
        console.log(error);
        return res.status(400).send({success:false,message:"Error while update user details",error})
    }
}

module.exports = {registerUser,loginUser,getUserProfile,updateProfile,adminLogin}
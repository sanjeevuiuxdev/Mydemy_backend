const cloudinary = require('cloudinary').v2
const dotenv = require("dotenv")

// config env
dotenv.config()

cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
})

const uploadMedia = async (file) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(file,{
            resource_type : "auto"
        })
        return uploadResponse
    } catch (error) {
        console.log(error);
    }
}

const deleteMediaFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log(error);
    }
}

const deleteVideoFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:'video'})
    } catch (error) {
        console.log(error);
    }
}

module.exports = {uploadMedia,deleteMediaFromCloudinary,deleteVideoFromCloudinary}
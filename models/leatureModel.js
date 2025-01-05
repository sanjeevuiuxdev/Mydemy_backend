
const mongoose = require('mongoose')

const leatureSchema = new mongoose.Schema({
    leatureTitle : {
        type : String,
        required : true
    },
    videoUrl : {
        type : String
    },
    publicId : {
        type : String
    },
    isPreview : {
        type : Boolean
    }
},{timestamps:true})

module.exports = mongoose.model("leatureSchema",leatureSchema)
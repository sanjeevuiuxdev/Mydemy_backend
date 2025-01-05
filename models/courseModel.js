const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    courseTitle : {
        type : String,
        required : true
    },
    subTitle : {
        type : String,
    },
    description : {
        type : String,
    },
    category : {
        type : String,
        required : true
    },
    courseLevel : {
        type : String,
        enum : ["Beginner" , "Medium" , "Advance"],
    },
    coursePrice : {
        type : Number
    },
    courseThumbnail : {
        type : String,
        default : ""
    },
    enrollerdStudent : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "userSchema"
    }],
    lectures : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'leatureSchema'
        }
    ],
    isPublished : {
        type : Boolean,
        default : false
    }

},{timestamps:true})

module.exports = mongoose.model('courseSchema',courseSchema)
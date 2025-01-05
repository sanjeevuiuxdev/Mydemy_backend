const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    enrolledCourses:[
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'courseSchema'
        }
    ],
    photoUrl : {
        type : String,
        default : ""
    },
    completedLectures : [{
        type: mongoose.Schema.Types.ObjectId,
        ref : 'leatureSchema'
    }]
},{timestamps:true})

module.exports = mongoose.model('userSchema',userSchema)
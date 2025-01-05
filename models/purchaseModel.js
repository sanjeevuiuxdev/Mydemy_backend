const mongoose = require("mongoose")
const purchaseCourseSchema = new mongoose.Schema({
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "courseSchema",
        required : true
    },
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "userSchema",
        required : true
    },
    amount : {
        type : Number,
        required : true
    },
    status : {
        type : String,
        enum : ['pending','completed','failed'],
        default : 'pending'
    },
    paymentId : {
        type : String,
        required : true
    }
},{timestamps:true})

module.exports = mongoose.model("purchaseCourseSchema",purchaseCourseSchema)
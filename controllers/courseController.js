const courseModel = require("../models/courseModel");
const leatureModel = require("../models/leatureModel");
const userModel = require("../models/userModel");
const { uploadMedia, deleteMediaFromCloudinary } = require("../utils/cloudinary");

// create course
const createCourse = async (req, res) => {
    try {
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req?.body
        var courseThumbnail = req?.file
        if (!courseTitle || !category) {
            return res.status(400).send({ success: false, message: "Please fill required field" })
        }
        // upload image
        const cloudResponse = await uploadMedia(courseThumbnail?.path);
        var courseThumbnail = cloudResponse?.secure_url;
        // console.log(courseThumbnail);
        const course = await new courseModel({ courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail }).save()
        return res.status(200).send({ success: true, message: "course created successfully", course })

        // if(course.data.success){
        //     return res.status(200).send({success:true,message:"course created successfully",course})
        // }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ success: false, message: "Field to create course", error })
    }
}

// get all course
const getAllCourse = async (req, res) => {
    try {
        const allCourse = await courseModel.find({})
        return res.status(200).send({ success: true, message: "All courses are fetched", allCourse })
    } catch (error) {
        return res.status(500).send({ success: false, message: "Field to fetch course", error })
    }
}

// get single course by id
const getSingleCourse = async (req, res) => {
    const id = req?.params?.id
    console.log("Received ID:", id);
    try {
        const getSingle = await courseModel.findById(id)
        if (getSingle) {
            res.status(200).send({ success: true, message: "fetched single course", getSingle })
        } else {
            res.status(400).send({ success: false, message: "course not found" })

        }
    } catch (error) {
        return res.status(500).send({ success: false, message: "error while single course", error })
    }
}

// update course
const updateSingleCourse = async (req, res) => {
    const id = req?.params?.id
    const { courseTitle, subTitle, description, category, courseLevel, coursePrice, isPublished } = req?.body
    let courseThumbnail = req?.file
    console.log("Request Body:", req?.body);
    console.log("Request File:", req?.file);
    console.log("Received ID:", id);
    try {
        const course = await courseModel.findById(id);
        if (!course) {
            return res.status(400).send({ success: false, message: "course not found" })
        }
        // extract public id of the old image from the url is it exists
        if (courseThumbnail) {
            // Extract public ID of the old image from the URL
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split('/').pop().split('.')[0];
                try {
                    await deleteMediaFromCloudinary(publicId);
                } catch (error) {
                    console.error("Error deleting old photo:", error);
                }
            }

            // Upload new thumbnail
            const cloudResponse = await uploadMedia(courseThumbnail?.path);
            courseThumbnail = cloudResponse?.secure_url; // Update the thumbnail URL
        } else {
            courseThumbnail = course?.courseThumbnail; // Retain the old thumbnail if no new file
        }


        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail, isPublished }

        const updatedCourse = await courseModel.findByIdAndUpdate(id, updateData, { new: true })

        if (updatedCourse) {
            return res.status(200).send({ success: true, message: "Update course successfully", updatedCourse })
        } else {
            return res.status(400).send({ success: false, message: "Failed to update course" });
        }
    } catch (error) {
        console.error("Error updating course:", error);
        return res.status(500).send({ success: false, message: "error while update course", error })
    }
}


// create leature 
const createLeature = async (req, res) => {
    try {
        const { leatureTitle, publicId, isPreview } = req?.body
        // let {videoUrl} = req?.file.path
        const { id } = req?.params;
        // console.log(leatureTitle);

        if (!leatureTitle || !id || !req.file) {
            return res.status(400).send({ success: false, message: "Leature title or course id is missing" })
        }

        // upload media
        const cloudResponse = await uploadMedia(req.file.path)
        const videoUrl = cloudResponse?.secure_url

        const cloudinaryPublicId = cloudResponse?.public_id; // Get the public ID for future reference

        if (!videoUrl) {
            return res.status(500).send({ success: false, message: "Video upload to Cloudinary failed" });
        }

        console.log('video url', videoUrl);

        const leature = new leatureModel({ leatureTitle, videoUrl, publicId: publicId || cloudinaryPublicId, isPreview })
        await leature.save();

        const course = await courseModel.findById(id).populate('lectures')
        console.log(course);
        if (!course) {
            return res.status(404).send({ success: false, message: "Course not found" });
        }
        course.lectures.push(leature?._id)
        await course.save()
        return res.status(200).send({ success: true, message: "Leature added successfully !!", course })
    } catch (error) {
        console.error("Error while Adding leature", error);
        return res.status(500).send({ success: false, message: "Error while Adding leature", error })
    }
}

// get lecture by id
const getCourseLeatures = async (req, res) => {
    const { id } = req?.params;
    try {
        const leatures = await courseModel.findById(id).populate('lectures')
        if (leatures) {
            res.status(200).send({ success: true, message: "Leatures are fetched", leatures })
        }
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error while fetching leature", error })
    }
}

const getSingleCourseLeatureData = async (req, res) => {
    const { courseId, leatureId } = req?.params
    try {
        const course = await courseModel.findById(courseId)
        if (!course) {
            return res.status(404).send({ success: false, message: "Course not found" });
        }
        const lectureIndex = course.lectures.findIndex(lec => lec.toString() === leatureId)
        if (lectureIndex === -1) {
            console.log("Lecture not found in course:", { courseId, leatureId });
            return res.status(404).send({ success: false, message: "Lecture not found in this course" });
        }
        const leatureData = await leatureModel.findById(leatureId)
        if (!leatureData) {
            // return res.status(200).send({success:true,message:"leature data is fetched",leatureData})
            return res.status(404).send({ success: false, message: "Lecture not found" });
        }
        return res.status(200).send({ success: true, message: "Leatures data are fetched", leatureData })
    } catch (error) {
        return res.status(500).send({ success: false, message: "Error while fetching leature data", error })
    }
}

// update course leature 
const updateCourseLeature = async (req, res) => {
    try {
        const {courseId, leatureId } = req?.params
        const { leatureTitle, publicId, isPreview } = req?.body
        // upload media
        const course = await courseModel.findById(courseId)
        if(!course){
            return res.status(500).send({ success: false, message: "Course is not found" })
        }
        const leature = await leatureModel.findById(leatureId)
        if (!leature) {
            return res.status(500).send({ success: false, message: "Leature is not found" })
        }
        let cloudinaryPublicId = leature?.publicId
        if(cloudinaryPublicId){
            try {
                await deleteMediaFromCloudinary(cloudinaryPublicId)
            } catch (error) {
                console.log("error while deleting video", error);
            }
        }

        //    upload new video 
        const cloudResponse = await uploadMedia(req?.file?.path)
        const videoUrl = cloudResponse?.secure_url

        cloudinaryPublicId = cloudResponse?.public_id

        const updatedData = { leatureTitle, videoUrl, publicId:publicId || cloudinaryPublicId, isPreview }
        const updatedLeature = await leatureModel.findByIdAndUpdate(leatureId,updatedData,{new:true})
        return res.status(200).send({success:true,message:"Leature updated successfully",updatedLeature})
    } catch (error) {
        console.log(error);
        return res.status(400).send({success:false,message:"Error while update leature details",error})
    }
}

// delete courseLeature
const deleteCourseLeature = async (req,res) => {
    try {
        const {courseId,leatureId} = req?.params
        const course = await courseModel.findById(courseId)
        if(!course){
            return res.status(400).send({success:false,message:"Course not found"})
        }
        const leature = await leatureModel.findById(leatureId)
        if(!leature){
            return res.status(400).send({success:false,message:"Lecture not found"})
        }
        const deleteLeature = await leatureModel.findByIdAndDelete(leatureId)
        return res.status(200).send({success:true,message:"Lecture deleted successfully"})
    } catch (error) {
        console.log(error);
        return res.status(400).send({success:false,message:"Something went wrong while deleting leature"})
    }
}

// get published course
const publishedCourse = async (req,res) => {
    try {
        const publishedCourses = await courseModel.find({isPublished:true})
        if(!publishedCourses){
            return res.status(400).send({success:false,message:"No Any Course Live"})
        }
        return res.status(200).send({success:true,message:"Fetched All Published Course",publishedCourses})
    } catch (error) {
        console.log(error);
        return res.status(400).send({success:false,message:"Something went wrong while fetching published course"})
    }
}

// get user enrollered course
const getEnrollerdCourse = async (req,res) => {
    const {id} = req?.body
    try {
        const user = await userModel.findById(id).populate('enrolledCourses')
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, message:"Enrollerd Courses" , user });
    } catch (error) {
        console.error("Error fetching purchased courses:", error.message);
        return res.status(500).json({ success: false, message: "Error fetching enrollerd courses", error });
    }
}

// update complete course
const updateCompleteCourse = async (req,res) => {
    const {userId,lectureId} = req?.body
    try {
        const user = await userModel.findById(userId)
        if(!user.completedLectures.includes(lectureId)){
            user.completedLectures.push(lectureId);
            await user.save();
            res.status(200).json({ success: true, message: "Lecture marked as completed" });
        }else {
            return res.status(400).json({ success: false, message: "Lecture already completed" });
        }
    } catch (error) {
        console.error("Error updating completed lecture:", error);
        res.status(500).json({ success: false, message: "Error updating lecture" });
    }
}

// get completed lecture
const getCompletedLecture = async (req,res) => {
    const {userId} = req.body
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, completedLectures: user.completedLectures });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching completed lectures" });
    }
}

module.exports = { createCourse, getAllCourse, getSingleCourse, updateSingleCourse, createLeature, getCourseLeatures, getSingleCourseLeatureData,updateCourseLeature,deleteCourseLeature ,publishedCourse,getEnrollerdCourse,updateCompleteCourse,getCompletedLecture}
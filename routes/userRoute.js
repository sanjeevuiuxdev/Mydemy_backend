const express = require('express')
const { registerUser, loginUser, getUserProfile, updateProfile, adminLogin } = require('../controllers/userController')
const { userAuth } = require('../middlewares/auth')
const upload = require('../utils/multer')
const { adminAuth } = require('../middlewares/adminAuth')
// const { default: upload } = require('../utils/multer')
const router = express.Router()

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post("/admin",adminLogin)
router.post('/userprofile',userAuth,getUserProfile)
router.put('/profile/update',userAuth,upload.single('profilePhoto'),updateProfile)

module.exports = router
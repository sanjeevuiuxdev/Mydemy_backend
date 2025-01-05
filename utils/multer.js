const multer = require("multer")

// const upload = multer({dest:'uploads/'})

// module.exports = upload;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Temporary folder for uploads
    },
    filename : function(req,file,callback){
        callback(null,`${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({storage})

module.exports = upload
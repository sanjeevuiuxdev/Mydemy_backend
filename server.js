const express = require("express")
const mongoose = require('mongoose')
const app = express()
const dotenv = require("dotenv")
const cors = require("cors")
const userRoutes = require('./routes/userRoute')
const courseRoutes = require("./routes/courseRoute")
const purchaseRoutes = require("./routes/purchaseRoute")

// config env
dotenv.config()

const PORT = process.env.PORT || 4000

// middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// app.set('view engine' , 'ejs')
// app.set("views",path.resolve('./views'))

// app.get('/render',async (req,res)=>{
//     return res.render('home')
// })

// all apis
app.use('/api/v1/user',userRoutes)
app.use('/api/v1/course',courseRoutes)
app.use('/api/v1/purchase',purchaseRoutes)

// app.get("/h" , (req,res) => { return res.send("<h1>This heading is from server side</h1>")})


app.get('/',(req,res)=>{
    res.send('Hello Anjali');
})


app.listen(PORT,()=>{
    console.log(`Server is running ... ${PORT}`);
    mongoose.connect(process.env.MONGO_DB_URI)
    .then((result) => {
        console.log("DB is connected");
    }).catch((err) => {
        console.log("DB is not connected",err);
    });
})


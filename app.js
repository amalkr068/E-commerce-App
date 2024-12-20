const express = require('express')
const app = express()
const env = require('dotenv').config()
const session = require("express-session")
const swal = require("sweetalert")
const { connectDB } = require('./config/db')
const  userRouter  = require('./routes/userRouter')
const passport = require("./config/passport")








app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())



app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})



app.set("view engine","ejs")
app.use(express.static('public'))


app.use('/',userRouter)






    connectDB().then(()=>{
        app.listen(process.env.PORT || 3002 ,()=>{
            console.log(`Server started in ${process.env.PORT}`)
        })
    })
    .catch((err)=>{
        console.log("Error",err.message)
    })







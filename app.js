const express = require('express')
const app = express()
const env = require('dotenv').config()
const { connectDB } = require('./config/db')
const  userRouter  = require('./routes/userRouter')








app.use(express.json())
app.use(express.urlencoded({extended:true}))



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







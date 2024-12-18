const express = require('express')
const app = express()
const env = require('dotenv').config()
const { connectDB } = require('./config/db')






    connectDB().then(()=>{
        app.listen(process.env.PORT || 3002 ,()=>{
            console.log(`Server started in ${process.env.PORT}`)
        })
    })
    .catch((err)=>{
        console.log("Error",err.message)
    })







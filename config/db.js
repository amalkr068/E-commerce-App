const mongoose = require('mongoose')

const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.mongodb_ConnectionString)
        console.log("db connected")
    }
    catch(err) {
        console.log("DB Connection Error",err.message)
    }
  


}


module.exports = { connectDB }
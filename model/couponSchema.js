const mongoose = require("mongoose")

const couponSchema = mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique:true
    },
    createdOn :{
        type:Date,
        default:Date.now,
        required:true
    },
    expiredOn :{
        type:Date,
        required:true,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    offerPrice:{
        type:Number,
        required:true
    },
    minimumPrice:{
        type:Number,
        required:true
    },
    isList :{
        type:Boolean,
        default:true
    },
    userEmail:{
        type:String,
        ref:"User"
    }
    
})


const Coupon = mongoose.model("Coupon",couponSchema)
module.exports = Coupon;
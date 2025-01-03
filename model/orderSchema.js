const mongoose = require("mongoose")

const Product = require("./productSchema")

const orderSchema = mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    deliveryDetails:{
        address:{type:String},
        pincode:{type:String},
        mobile:{type:String}
    },
    paymentMethod:{type:String},
    products:[{
        productId:{type:mongoose.Schema.Types.ObjectId,ref:'Product'},
        quantity:{type:Number}
    }],
    
    date:{type:Date},
    totalAmount:{type:Number},
    status:{type:String}
    
})


const Order = mongoose.model("Order",orderSchema)
module.exports = Order
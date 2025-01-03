const mongoose = require("mongoose")

const cartSchema = mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    items: [{
        productId :{
            type : mongoose.Schema.Types.ObjectId,
            ref:"Product"
            
        },
        quantity:{
            type:Number,
            
        },
        
    }]
})

const Cart = mongoose.model("Cart",cartSchema)
module.exports = Cart;
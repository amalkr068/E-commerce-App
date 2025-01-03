const mongoose = require("mongoose")
const Product = require("./productSchema")

const wishlistSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },
    productId :[{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        }]
       

    
})


const Wishlist = mongoose.model("Wishlist",wishlistSchema)
module.exports = Wishlist;
const mongoose = require("mongoose")


const userSchema = mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    email :{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:false,
        unique:true,
        sparse:true,
        default:null
    },
    googleId:{
        type:String,
        required:false,
        unique:true,
        sparse:true,
        default:null
    },
    password:{
        type:String,
        required:false
        
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    cart:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Cart"
    }],
    wallet:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Wishlist"
    }],
    orderHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Order"
    }],
    createdOn:{
        type:Date,
        default:Date.now
    },
    referalCode:{
        type:String,
        //required:true
    },
    redeemed:{
        type:Boolean,
        //required:true
    },
    redeemedUsers:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    searchHistory: [{
        category:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"Category"
        },
        brand:{
            type:String
        },
        searchOn :{
            type:Date,
            default:Date.now
        }
    }],
    wishlist: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Product',
        default: []  // Ensures the wishlist is an empty array by default
    }

})

const User = mongoose.model("User",userSchema)

module.exports = User;
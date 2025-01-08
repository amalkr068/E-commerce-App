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
    searchHistory: [
        {
          category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
          brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
          searchedOn: { type: Date, default: Date.now },
        }
      ]

    

})

const User = mongoose.model("User",userSchema)

module.exports = User;
const mongoose = require("mongoose")

const walletSchema = mongoose.Schema({

    amount:{
        type:Number,
        required:true
    },
    userEmail:{
        type:String,
        required:true

    }
})


const Wallet = mongoose.model("Wallet",walletSchema)
module.exports = Wallet;
const mongoose = require("mongoose")


const reviewSchema = mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
    },
    reviewText:{
        type:String

    },
    image:{
        type:String
    }
})

const Review = mongoose.model('Review',reviewSchema)
module.exports = Review;
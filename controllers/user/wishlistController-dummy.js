const User = require("../../model/userSchema")
const Product = require("../../model/productSchema")





const loadwishlist = async (req,res)=>{
    try {
        const userId = req.session.user
        const user = await User.findById(userId)
        const products = await Product.find({_id:{$in:user.wishlist}}).populate('category')

        res.render("user/wishlist",{
            user,
            wishlist:products
        })





    } catch (error) {
        console.error(error)
        res.redirect("/pageNotFound")

    }
}


const addToWishlist = async (req,res)=>{
    try {
        const productId = req.body.productId
        const userId = req.session.user
        const user = await User.findById(userId)
        if (!user.wishlist) {
            user.wishlist = [];
        }

        if(user.wishlist.includes(productId)){
            return res.status(200).json({status:false, message:"Product already exist is wishlist"})
        }

        user.wishlist.push(productId)
        await user.save()
        return res.status(200).json({status:true,message:"Product added to wishlist"})


    } catch (error) {
        
        console.error(error)
        return res.status(500).json({status:false,message:'Server Error'})
    }
}


const removeProduct = async (req,res)=>{
    try {
        const productId = req.query.productId
        const userId = req.session.user
        const user = await User.findById(userId)
        const index = user.wishlist.indexOf(productId)
        user.wishlist.splice(index,1)
        await user.save()
        return res.redirect("/wishlist")


    } catch (error) {
        console.error(error)
        return res.status(500).json({status:false,message:'Server error'})
    }
}



module.exports = { loadwishlist,addToWishlist,removeProduct }
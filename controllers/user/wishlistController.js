const Wishlist = require("../../model/wishlistSchema")
const User = require("../../model/userSchema")
const Product = require("../../model/productSchema")
const mongoose = require("mongoose")
const { getCartAndWishlistData } = require("../../controllers/user/cartController")





const loadwishlist = async (req,res)=>{
    try {
        const userId = req.session.user
        const { cartTotalQuantity, cartTotalAmount, wishlistCount } = await getCartAndWishlistData(userId);
        //const findWishlist = await Wishlist.findOne({userId:userId})
        const user = await User.findById(userId)
        //const products = await Wishlist.find({userId:userId}).populate("productId")
        const wishlist = await Wishlist.findOne({ userId: userId }).populate('productId');

        if(!wishlist){
            res.render("user/wishlist",{user,wishlist:0,wishlistCount:0,totalQuantity:0})
        }else {
            res.render("user/wishlist",{
                user,
               wishlist:wishlist.productId ,
               totalQuantity:cartTotalQuantity,
               wishlistCount
            })
        }
        //console.log(wishlist.productId)

        





    } catch (error) {
        console.error(error)
        res.redirect("/pageNotFound")

    }
}


const addToWishlist = async (req,res)=>{
    try {
        

        const productId = req.body.productId
        const oid = new mongoose.Types.ObjectId(productId);
       // console.log(productId)
        const userId = req.session.user

       const findUser = await Wishlist.findOne({userId:userId})

       if (!mongoose.Types.ObjectId.isValid(oid)) {
        console.log("Error")
        return res.status(400).json({ status: false, message: 'Invalid product ID' });
      }

       if(!findUser){
        
        const newWishlist = new Wishlist({
            userId:userId,
            productId:[oid]
        })

       await newWishlist.save()
       return res.status(200).json({status:true,message:"Product added to wishlist"})

       }

       const existingProduct = findUser.productId.includes(productId)
        
        if (existingProduct) {
            return res.status(200).json({ status: false, message: "Product already exists in wishlist" });
        } else {

       await findUser.productId.push(oid)
       findUser.save()
       return res.status(200).json({status:true,message:"Product added to wishlist"})

       }
    } catch (error) {
        
        console.error(error)
        return res.status(500).json({status:false,message:'Server Error'})
    }
    



}



const removeFromWishlist = async (req,res)=>{
    try {
        const prodId = req.query.productId

        const userId = req.session.user
    
        const wishlist = await Wishlist.findOne({userId:userId})
        const index = await wishlist.productId.indexOf(prodId)
        //console.log(index)

        if (index === -1) {
            return res.status(404).json({ message: 'Product not found in wishlist.' });
          }

          wishlist.productId.splice(index,1)
          await wishlist.save()

             //res.status(200).json({ message: 'Product removed from wishlist.' });
             return res.redirect("/wishlist")

    } catch (error) {
        console.error(error)
        return res.status(500).json({status:false,message:'Server error'})
    }
   
}



module.exports = { addToWishlist,loadwishlist,removeFromWishlist }
const User = require("../../model/userSchema")
const Cart = require("../../model/cartSchema")
const Wishlist = require("../../model/wishlistSchema")
const mongoose = require("mongoose")





const getCartAndWishlistData = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const wishlist = await Wishlist.findOne({ userId }).populate("productId");

    let cartTotalQuantity = 0;
    let cartTotalAmount = 0;

    if (cart) {
      cart.items.forEach(item => {
        cartTotalQuantity += item.quantity;
        cartTotalAmount += item.quantity * item.productId.salePrice;
      });
    }

    let wishlistCount = 0;
    if (wishlist) {
      wishlistCount = wishlist.productId.length;
    }

    return {
      cartTotalQuantity,
      cartTotalAmount,
      wishlistCount
    };
  } catch (error) {
    console.error(error);
    return { cartTotalQuantity: 0, cartTotalAmount: 0, wishlistCount: 0 };
  }
};


const getCartPage = async (req,res)=>{

  try {
    const userId = req.session.user
    const { cartTotalQuantity, cartTotalAmount, wishlistCount } = await getCartAndWishlistData(userId);

     // Store values in session
     req.session.cartTotalQuantity = cartTotalQuantity;
     req.session.cartTotalAmount = cartTotalAmount;
     req.session.wishlistCount = wishlistCount;


    console.log("Total=",req.session.cartTotalAmount)
    const user = await User.findById(userId)
    //console.log(user)
  const cart = await Cart.findOne({userId:userId}).populate("items.productId")
  //console.log("man=",cart)
 /*cart.items.forEach(item => {
  console.log(item.productId); // This should show the full product data
});*/

  // totalQuantity = (totalQuantity) ? 'req.session.totalQuantity' : 0
  // console.log("Total :",totalQuantity)
if (!cart) {
  return res.render('user/cart', { data: [] ,user,Total:0, totalQuantity:0,wishlistCount });
}




const data=cart.items
//console.log("man=",data)



//const cart = await Cart.findOne({userId:userId}).populate("items.productId")
//console.log(cart.items)
//let x = 0;
//let totalQuantity =0
// Loop through items to calculate the total price (including quantity * salePrice)
//for (let i = 0; i < cart.items.length; i++) {
  //const product = cart.items[i].productId; // Populate productId
  //const quantity = parseInt(cart.items[i].quantity);
 // totalQuantity = totalQuantity+quantity
 // const salePrice = parseInt(product.salePrice); // Assuming salePrice is part of product
 // x += (quantity * salePrice);
 // req.session.totalAmount = x
//}
//req.session.totalQuantity=totalQuantity;
//console.log("Total :",totalQuantity)
//console.log(data[0].productId.productName)

res.render("user/cart", {
  
  totalQuantity:req.session.cartTotalQuantity,
  data,
  Total:req.session.cartTotalAmount,
  user,
  wishlistCount
});

  } catch (error) {
    console.error(error);
    return res.redirect("/pageNotFound");
  }
  

}











const addToCart = async (req,res)=>{
 x= req.session.totalAmount 
  try {
    const productId = req.body.productId
    const userId = req.session.user
   // totalQuantity = req.session.totalQuantity
    const oid = new mongoose.Types.ObjectId(productId)

    const cartUser = await Cart.findOne({userId:userId})

    if(!cartUser){
      const newCart = await new Cart({
        userId:userId,
        items:[{productId:productId,quantity:1}]
      })
      await newCart.save()
      //totalQuantity = req.session.totalQuantity+1
      return res.status(200).json({status:true,message:"Product added to Cart",totalQuantity:1})
   }

  

   //const existingProduct = cartUser.items[0].productId.includes(oid)
   const existingProduct = cartUser.items.find(item => item.productId.toString() === productId.toString());

   if(existingProduct){

    existingProduct.quantity += 1;
      //await cartUser.save();
    
      //console.log(existingProduct.salePrice)
      //totalQuantity = req.session.totalQuantity+1
      //return res.status(200).json({ status: true, message: "Product quantity updated in Cart",newQuantity:existingProduct.quantity,totalQuantity});

     
   } else {

        cartUser.items.push({productId:productId,quantity:1})

   }
        await cartUser.save()
        //totalQuantity = req.session.totalQuantity+1
        const totalQuantity = cartUser.items.reduce((sum, item) => sum + item.quantity, 0);
        return res.status(200).json({status:true,message:"Product added to Cart",Total:x,totalQuantity})
   

  




  } catch (error) {
    console.error(error)
        return res.status(500).json({status:false,message:'Server Error'})
  }

}



const changeQuantity = async (req,res)=>{
  try {
    const productId = req.body.productId
    //console.log(typeof(productId))

    const count = parseInt(req.body.count)
    //console.log(typeof(count))
    const userId = req.session.user
    const cart = await Cart.findOne({userId:userId}).populate("items.productId")
    console.log("Cart = ",cart.items)

    const cartUser = await Cart.findOne({userId:userId})
   // console.log(cartUser)
    const existingProduct = cartUser.items.find(item => item.productId == productId);
    //console.log(existingProduct)
    if(existingProduct){

      //console.log(existingProduct.quantity)
    existingProduct.quantity =existingProduct.quantity+ count;
    console.log("amal:",existingProduct.quantity)


      // If the quantity becomes 0 or less, remove the product from the cart
      if (existingProduct.quantity <= 0) {
        const productIndex = cartUser.items.findIndex(item => item.productId.toString() === productId.toString());
        cartUser.items.splice(productIndex, 1);
      }

        
      await cartUser.save();

      const updatedCart = await Cart.findOne({ userId }).populate("items.productId");


       // Recalculate the total quantity in the cart
      // const totalQuantity = cartUser.items.reduce((sum, item) => sum + item.quantity, 0);

      // Recalculate the total quantity and total amount in the cart
      let totalQuantity = 0;
      let totalAmount = 0;

      updatedCart.items.forEach(item => {
        totalQuantity = totalQuantity+ item.quantity;
        totalAmount = totalAmount+ (item.quantity * item.productId.salePrice);  // assuming salePrice is part of the product
      });

      // Update session variables
      req.session.totalQuantity = totalQuantity;
      req.session.totalAmount = totalAmount;
console.log("Total =",totalAmount)

      //console.log(existingProduct.quantity)
      //console.log(existingProduct.salePrice)
//console.log(existingProduct.quantity)
      
     // return res.status(200).json({ status: true, message: "Product quantity updated in Cart" ,quantity:existingProduct.quantity});
     return res.status(200).send({status:true, quantity:existingProduct.quantity,totalQuantity:totalQuantity,totalAmount:totalAmount})
      //res.redirect("/cart")

    }







  } catch (error) {
    console.error(error)
    return res.status(500).json({status:false,message:'Server Error'})
  }



}


const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;

   // console.log("Product Id =",id)
    const userId = req.session.user;
    const userCart = await Cart.findOne({userId:userId});
    //console.log("User Cart =",userCart.items)
   /* console.log(userCart.items); // This will log the array of items
  userCart.items.forEach(item => {
    console.log(item); // Logs each item object individually
});*/

    const cartIndex = await userCart.items.findIndex((item) => item.productId == id);
    console.log("CartIndex =",cartIndex)
    userCart.items.splice(cartIndex, 1);
    await userCart.save();
   res.redirect("/cart");
  } catch (error) {
    console.log(error)
    res.redirect("/pageNotFound");
  }
};


module.exports = { addToCart,getCartPage,changeQuantity,deleteProduct,getCartAndWishlistData }
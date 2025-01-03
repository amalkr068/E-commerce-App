const User = require("../../model/userSchema")
const Cart = require("../../model/cartSchema")
const mongoose = require("mongoose")


const getCartPage = async (req,res)=>{

  try {
    const userId = req.session.user
    const user = await User.findById(userId)
    //console.log(user)
  const cart = await Cart.findOne({userId:userId}).populate("items.productId")
  //console.log(cart.items)
 /*cart.items.forEach(item => {
  console.log(item.productId); // This should show the full product data
});*/

  // totalQuantity = (totalQuantity) ? 'req.session.totalQuantity' : 0
  // console.log("Total :",totalQuantity)
if (!cart) {
  return res.render('user/cart', { data: [], grandTotal: 0 ,user,Total:0, totalQuantity:0});
}


const data=cart.items



//const cart = await Cart.findOne({userId:userId}).populate("items.productId")
//console.log(cart.items)
let x = 0;
let totalQuantity =0
// Loop through items to calculate the total price (including quantity * salePrice)
for (let i = 0; i < cart.items.length; i++) {
  const product = cart.items[i].productId; // Populate productId
  const quantity = parseInt(cart.items[i].quantity);
  totalQuantity = totalQuantity+quantity
  const salePrice = parseInt(product.salePrice); // Assuming salePrice is part of product
  x += (quantity * salePrice);
  req.session.totalAmount = x
}
req.session.totalQuantity=totalQuantity;
//console.log("Total :",totalQuantity)
//console.log(data[0].productId.productName)

res.render("user/cart", {
  
  totalQuantity:req.session.totalQuantity,
  data,
  Total:req.session.totalAmount,
  user
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
    totalQuantity = req.session.totalQuantity
    const oid = new mongoose.Types.ObjectId(productId)

    const cartUser = await Cart.findOne({userId:userId})

    if(!cartUser){
      const newCart = await new Cart({
        userId:userId,
        items:[{productId:productId,quantity:1}]
      })
      await newCart.save()
      return res.status(200).json({status:true,message:"Product added to Cart"})
   }

  

   //const existingProduct = cartUser.items[0].productId.includes(oid)
   const existingProduct = cartUser.items.find(item => item.productId.toString() === productId.toString());

   if(existingProduct){

    existingProduct.quantity += 1;
      await cartUser.save();
    
      //console.log(existingProduct.salePrice)

      return res.status(200).json({ status: true, message: "Product quantity updated in Cart",newQuantity:existingProduct.quantity});

     
   } else {

        cartUser.items.push({productId:productId,quantity:1})
        await cartUser.save()
        return res.status(200).json({status:true,message:"Product added to Cart",Total:x})
   }

  




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

    const cartUser = await Cart.findOne({userId:userId})
   // console.log(cartUser)
    const existingProduct = cartUser.items.find(item => item.productId == productId);
    //console.log(existingProduct)
    if(existingProduct){

      //console.log(existingProduct.quantity)
    existingProduct.quantity += count;
   // console.log("amal:",existingProduct.quantity)
  
      await cartUser.save();

      //console.log(existingProduct.quantity)
      //console.log(existingProduct.salePrice)

      
      return res.status(200).json({ status: true, message: "Product quantity updated in Cart" });
      res.redirect("/cart")

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


module.exports = { addToCart,getCartPage,changeQuantity,deleteProduct }
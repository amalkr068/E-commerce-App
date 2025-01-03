const Cart = require("../../model/cartSchema")
const User = require("../../model/userSchema")
const Order = require("../../model/orderSchema")
const Razorpay = require('razorpay')
const env = require('dotenv').config()
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const mongoose = require('mongoose')


var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });



const getCheckoutPage = (req,res)=>{
   
    let totalAmount = req.session.totalAmount
    //console.log(totalAmount)
    res.render("user/checkout",{totalAmount})
}


const placeOrder = async (req,res)=>{
    let totalAmount = req.session.totalAmount
    let amountinpaisa= totalAmount*100
     let status = req.body.payment === 'cod'? 'placed':'pending'
    //console.log(req.body)
    const cartProducts = await Cart.findOne({userId:req.session.user})
    //console.log("Cart products=",cartProducts)
    let totalQuantity = 0;
    if (cartProducts) {
        totalQuantity = cartProducts.items.reduce((acc, item) => acc + item.quantity, 0);
    }
    //console.log(cartProducts.items[0].productId)
    //console.log(cartProducts.items.quantity)
    if (!cartProducts || !cartProducts.items || cartProducts.items.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty. Please add products to the cart.' });
    }
    const products = await cartProducts.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
    }));

    newOrder = await new Order({

        userId:req.session.user,
        deliveryDetails:{
            address:req.body.address,
            pincode:req.body.pincode,
            mobile:req.body.mobile
        },
        paymentMethod:req.body.payment,
        
        products:products,
            
         date:new Date(),
        status:status,
        totalAmount:totalAmount,
        
    })

    await newOrder.save()
    const ord = newOrder._id
   //console.log("Order IId :",newOrder._id)
    await Cart.deleteOne({userId:req.session.user})
    //return res.render("user/order-placed",{totalAmount,totalQuantity})
    if(req.body.payment === 'cod'){
        return res.status(200).json({success:true})
    }else{
        
        var options = {
            amount:newOrder.totalAmount*100,
            currency:"INR",
            receipt:newOrder._id
        };
        instance.orders.create(options, function(err,order){
            if(err){
                console.log(err)
            }
           // console.log("New order =",order)
            res.json({status:true, order:order})
        })

       
    }
   
    
}

const orderConfirmation = (req,res)=>{

    let totalAmount = req.session.totalAmount
    res.render("user/order-placed",{totalAmount})
}



const verifyPayment = async(req,res)=>{
    console.log("Response =",req.body.response)
    console.log("Order=",req.body.order)
    const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
    hmac.update(req.body.response.razorpay_order_id + '|'+req.body.response.razorpay_payment_id)
    hmac=hmac.digest('hex')
    if(hmac==req.body.response.razorpay_signature){
        //await Cart.findOneAndUpdate({_id:new mongoose.Types.ObjectId(req.body.order.receipt)},{$set:{status:'Placed'}})
       // console.log("Payment successful")
        //res.json({status:true})
       // console.log("Order Id=",req.body.order.order.id)
       try {
        // Convert the receipt string to a valid ObjectId
        const receiptId = new mongoose.Types.ObjectId(req.body.order.order.receipt);
        console.log("Receipt:",receiptId)

        // Check if the cart with this receipt ID exists
        //const order = await Order.findOne({_id: receiptId });

        /*if (!order) {
            console.log("Cart not found");
            return res.status(404).json({ status: false, error: 'Cart not found.' });
        }*/

        // Update the cart status to 'Placed'
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: receiptId },
            { $set: { status: 'Placed' } },
            { new: true }  // This will return the updated document
        );

        if (!updatedOrder) {
            console.log("Cart not updated");
            return res.status(500).json({ status: false, error: 'Failed to update cart status.' });
        }

        console.log("Payment successful");
        res.json({ status: true });
    } catch (err) {
        console.error('Error updating cart:', err);
        res.status(500).json({ status: false, error: 'Failed to update cart.' });
    }
    }else{
        res.json({status:false})
    }
}


const viewOrderList = async(req,res)=>{
    const userId = req.session.user
    const orders =await Order.find({userId:userId})
    console.log("Order=",orders)
    res.render("user/order-list",{orders:orders})
}

const viewOrderedProducts = async(req,res)=>{
    const orderId = req.query.id
   const products = await Order.findOne({_id:orderId}).populate("products.productId")
    console.log("Order:",orderId)
    console.log("Products=",products.products)
    res.render("user/view-order-products",{products:products.products})
}
module.exports = { getCheckoutPage,placeOrder,orderConfirmation,verifyPayment,viewOrderList,viewOrderedProducts } 
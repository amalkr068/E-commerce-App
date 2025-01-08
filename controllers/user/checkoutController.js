const Cart = require("../../model/cartSchema")
const User = require("../../model/userSchema")
const Order = require("../../model/orderSchema")
const Coupon = require("../../model/couponSchema")
const Address = require("../../model/addressSchema")
const Wallet = require("../../model/walletSchema")
const Razorpay = require('razorpay')
const env = require('dotenv').config()
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const mongoose = require('mongoose')


var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });



const getCheckoutPage = async(req,res)=>{
   
    let totalAmount = req.session.totalAmount
    const userId = req.session.user
    const user = await User.findOne({_id:userId})
    const coupons = await Coupon.find({userEmail:user.email})
    const address = await Address.findOne({userId:userId})
   // console.log("Addresses:",address)
    //console.log("Coupons:",coupons)

    //console.log(totalAmount)
    res.render("user/checkout",{totalAmount,coupons,address})
}


const placeOrder = async (req,res)=>{
   // let totalAmount = req.session.totalAmount
   const { address,paymentMethod,totalAmount } = req.body
   const user = await User.findOne({_id:req.session.user})
  // console.log("Adress:",address)
   console.log("payment Method:",paymentMethod)
   //console.log("totalAmount:",totalAmount)

    let amountinpaisa= totalAmount*100
     let status = paymentMethod === 'cod'? 'placed':'pending'
   // let status = paymentMethod === 'cod'? 'placed':'pending'
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
            address:address
        },
        paymentMethod:paymentMethod,
        
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
    if(paymentMethod === 'cod'){
        return res.status(200).json({success:true})
    }else if(paymentMethod === 'razorpay'){
        
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

       
    }else if(paymentMethod === 'wallet') {
        const userEmail = user.email
        const wallet = await Wallet.findOne({userEmail:userEmail})

        if (!wallet || wallet.amount < totalAmount) {
            return res.status(400).json({ error: 'Insufficient wallet balance' });
        }

        wallet.amount -= totalAmount;
        await wallet.save();
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: ord },
            { $set: { status: 'Placed' } },
            { new: true }  // This will return the updated document
        );



        return res.status(200).json({ victory: true, message: 'Order placed and wallet deducted' });
        


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
    const reverseOrders = orders.reverse()
    //console.log("Order=",orders)
    res.render("user/order-list",{orders:reverseOrders})
}

const viewOrderedProducts = async(req,res)=>{
    const orderId = req.query.id
    const orderUpdate = await Order.findOne({_id:orderId})
    //console.log("OrderUpdate:",orderUpdate)
   const products = await Order.findOne({_id:orderId}).populate("products.productId")
    //console.log("Order:",orderId)
    //console.log("Products=",products.products)
    res.render("user/view-order-products",{products:products.products,order:orderUpdate})
}


const returnProduct = async (req,res)=>{
    //const orderId=req.data.orderId
    //console.log("return orderId =",req.body)
    const orderId = req.body.orderId
    const returnProd = await Order.findOneAndUpdate({_id:orderId},{$set:{isReturn:'pending'}})
    await returnProd.save()
    console.log("Return =",returnProd)
    res.json({status:true})
}

const applyCoupon = async (req,res)=>{

    const {couponValue} = req.body
    //console.log("Coupon Value:",couponValue)
    let totalAmount = parseInt(req.session.totalAmount)
    let offerPrice = 0
    const coupon = await Coupon.findOne({name:couponValue})
    if(coupon){
         offerPrice = parseInt(coupon.offerPrice)
        console.log(coupon)
        
        totalAmount = totalAmount-offerPrice
        res.status(200).json({status:true,totalAmount,offerPrice})

    }else {
        res.json({status:true,totalAmount,offerPrice})
    }
   
    //req.session.totalAmount = totalAmount

   




}




module.exports = { getCheckoutPage,placeOrder,orderConfirmation,verifyPayment,viewOrderList,viewOrderedProducts,returnProduct,applyCoupon } 
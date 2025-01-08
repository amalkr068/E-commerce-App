const Cart = require("../../model/cartSchema")
const User = require("../../model/userSchema")
const Order = require("../../model/orderSchema")
const Coupon = require("../../model/couponSchema")
const Address = require("../../model/addressSchema")
const Wallet = require("../../model/walletSchema")
const Review = require("../../model/reviewSchema")
const Razorpay = require('razorpay')
const easyinvoice = require("easyinvoice")
const pdfjsDist = require('pdfjs-dist');

const fs = require("fs")
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
     let status = paymentMethod === 'cod'? 'Placed':'pending'
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
            return res.status(400).json({ status:false, error: 'Insufficient wallet balance' });
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




const downloadInvoice = async (req,res)=>{

    const orderId = req.query.id
    const orderUpdate = await Order.findOne({_id:orderId})
    const order = await Order.findOne({ _id: orderId }).populate("products.productId");

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    // Map the populated products into the format needed for the invoice
    const products = order.products.map(product => ({
        quantity: product.quantity,  // Get the quantity of the product from the order
        description: product.productId.productName, // Get the product name from the product document
        taxRate: 18,  // You can set this dynamically based on your tax rules
        price: product.productId.salePrice  // Get the product price from the product document
    }));

    // Log the products array to see what it looks like
    console.log("Products for invoice:", products);

    const orderDate = new Date(orderUpdate.date);
        const formattedOrderDate = orderDate.toISOString().split('T')[0]; 
        //console.log("Date:",formattedOrderDate)

    // Calculate the due date (14 days from the order's date)
    const dueDate = new Date(formattedOrderDate);  // Start with the order's date
    dueDate.setDate(dueDate.getDate() + 14);  // Add 14 days to the order's date
    const dueDateString = dueDate.toISOString().split('T')[0];  // Format the date (ISO format without the time)
    console.log("Date:",dueDateString)

     //const products= await product.products.items.map(item => ({
    
      // quantity: item.quantity,
      // name:item.productName

   // }));
    //console.log("Products=",products)

    if(orderUpdate.status === 'Placed'){

        var data = {
        //apiKey: "free", // Please register to receive a production apiKey: https://app.budgetinvoice.com/register
       // mode: "development", // Production or development, defaults to production   
        images: {
            // The logo on top of your invoice
            logo: "https://th.bing.com/th/id/OIP._j2eoHHM8XDQWp_I91JhPgHaHa?w=190&h=190&c=7&r=0&o=5&dpr=1.3&pid=1.7" ,
            // The invoice background
            //background: "https://public.budgetinvoice.com/img/watermark-draft.jpg"
        },
        // Your own data
        sender: {
            company: "Men Fashion",
            address: "Chalissery",
            zip: "kavukkode",
            city: "Palakkad",
            country: "India"
            // custom1: "custom value 1",
            // custom2: "custom value 2",
            // custom3: "custom value 3"
        },
        // Your recipient
        client: {
            company: "",
            address:  order.deliveryDetails.address, 
            zip: "",
            city: "",
            country: ""
            // custom1: "custom value 1",
            // custom2: "custom value 2",
            // custom3: "custom value 3"
        },
        information: {
            // Invoice number
            number:orderUpdate._id,
            // Invoice data
            date: formattedOrderDate,
            // Invoice due date
            dueDate: dueDateString 
        },
        // The products you would like to see on your invoice
        // Total values are being calculated automatically
        
        products:products
        
      /*  [
            
            {
                quantity: 2,
                description: "Product 1",
                taxRate: 6,
                price: 33.87
            }
        
        ] */
            ,
        // The message you would like to display on the bottom of your invoice
        bottomNotice: "Kindly pay your invoice within 15 days.",
        // Settings to customize your invoice
        settings: {
            currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
             locale: "en-IN", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
             marginTop: 25, // Defaults to '25'
             marginRight: 25, // Defaults to '25'
            marginLeft: 25, // Defaults to '25'
             marginBottom: 25, // Defaults to '25'
            format: "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
             height: "1000px", // allowed units: mm, cm, in, px
             width: "500px", // allowed units: mm, cm, in, px
             orientation: "landscape" // portrait or landscape, defaults to portrait
        },
        // Translate your invoice to your preferred language
        translate: {
            // invoice: "FACTUUR",  // Default to 'INVOICE'
            // number: "Nummer", // Defaults to 'Number'
            // date: "Datum", // Default to 'Date'
            // dueDate: "Verloopdatum", // Defaults to 'Due Date'
            // subtotal: "Subtotaal", // Defaults to 'Subtotal'
            // products: "Producten", // Defaults to 'Products'
            // quantity: "Aantal", // Default to 'Quantity'
            // price: "Prijs", // Defaults to 'Price'
            // productTotal: "Totaal", // Defaults to 'Total'
            // total: "Totaal", // Defaults to 'Total'
            // taxNotation: "btw" // Defaults to 'vat'
        },
    
        // Customize enables you to provide your own templates
        // Please review the documentation for instructions and examples
        // "customize": {
        //      "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
        // }
    };
    
    //Create your invoice! Easy!
    easyinvoice.createInvoice(data,  function (result) {
        //The response will contain a base64 encoded PDF file
        //console.log('PDF base64 string: ', result.pdf);
        //await fs.writeFileSync("invoice.pdf",result.pdf,'base64')
        
            // The result will contain a base64 encoded PDF file
    
            // Send the generated PDF as a response to the client
            try {
                if (!result.pdf) {
                    throw new Error("No PDF returned from easyinvoice.");
                }
                // Send the generated PDF as a response to the client
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
                res.send(Buffer.from(result.pdf, 'base64'));
            } catch (error) {
                console.error("Error sending PDF:", error);
                if (!res.headersSent) {
                    res.status(500).send('Error generating invoice');
                }
               // res.status(500).send('Error generating invoice');
            }
        }).catch((error) => {
            // Catching any unhandled promise rejections
            console.error('Error creating invoice:', error);
            if (!res.headersSent) {
                res.status(500).send('Error generating invoice');
            }
           // res.status(500).send('Error generating invoice');
        });   

    } else {
        res.redirect("/view-order-list")
        console.log("Order is not Placed")

    }
    }
    
   const addReview = async (req,res)=>{

        try {
            const reviewText = req.body.reviewText
            const reviewImage = req.file ? req.file.filename : null;
            const productId = req.body.productId
            const orderId = req.body.orderId
            const userId = req.session.user
            //console.log("Text =",reviewText)
            //console.log("image =",reviewImage)
            //console.log("productId =",productId)
            //console.log("ordertId =",orderId)

            const newReview = new Review({

                userId:userId,
                productId:productId,
                reviewText:reviewText,
                image:reviewImage
            })

            await newReview.save()
            res.redirect(`/view-orderedproducts?id=${orderId}`)



        } catch (error) {
            
        }

   } 






module.exports = { getCheckoutPage,placeOrder,orderConfirmation,verifyPayment,viewOrderList,viewOrderedProducts,returnProduct,applyCoupon,downloadInvoice,addReview } 
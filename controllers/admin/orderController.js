const Order = require("../../model/orderSchema")


const orderList = async(req,res)=>{
    const order= await Order.find({})
    const orders =order.reverse()
   // console.log(orders)
   res.render("admin/order-list",{orders:orders})
}

const viewOrderedProducts = async(req,res)=>{
    const orderId = req.query.id
//console.log("query:",orderId)
    const order = await Order.findOne({_id:orderId})
//console.log("Order=",order)
    res.render("admin/order-management",{orders:order})
}


const updateTracking = async (req,res)=>{
   const { orderId,status } = req.body
   console.log(req.body)
   const updateStatus = await Order.findOneAndUpdate({_id:orderId},{$set:{orderStatus:status}})
   await updateStatus.save()
   console.log("New=",updateStatus)
   res.status(200).json({status:true})

    

}


const returnReply = async (req,res)=>{
    console.log(req.query)
    const orderId = req.query.id
    const status = req.query.status
    const returnrep  = await Order.findOneAndUpdate({_id:orderId},{$set:{isReturn:status}})
    //await returnrep.save()
    //const order = await Order.findOne({_id:orderId})

    res.redirect("/admin/orderList")
   // res.json({status:true})
}

module.exports={orderList,viewOrderedProducts,updateTracking,returnReply}
const Order = require("../../model/orderSchema")


const orderList = async(req,res)=>{
    const order= await Order.find({})
    const orders =order.reverse()
    console.log(orders)
   res.render("admin/order-list",{orders:orders})
}


module.exports={orderList}
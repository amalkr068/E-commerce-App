const Order = require("../../model/orderSchema")


let data;
async function getTotalAmountPerDay() {
  try {
    const result = await Order.aggregate([
      {
        // Group by the day (date) - only consider the date part, ignoring the time
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalAmount: 1, // Include the totalAmount in the projection
        },
      },
      {
        // Group by the day and sum the totalAmount for each day
        $group: {
          _id: "$day", // The day (date without time)
          totalAmountForDay: { $sum: "$totalAmount" }, // Sum of totalAmount for each day
        },
      },
      {
        // Sort the results by day in ascending order (optional)
        $sort: { _id: 1 },
      },
    ]);

    return result;
  } catch (err) {
    console.error("Error while getting total amounts per day:", err);
    return []; 
  }
}

// Example usage:



const getDashboard = async (req,res)=>{
    console.log("Backend Route Triggered");
    const datas = await getTotalAmountPerDay()
    //const data = await JSON.stringify(datas)
    //console.log("Data :",data)
      
    res.render("admin/admin-dashboard",{data:datas})

}

module.exports = { getDashboard }
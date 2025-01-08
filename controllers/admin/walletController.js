const Wallet = require("../../model/walletSchema")
const User = require("../../model/userSchema")


const loadWalletPage = async (req,res)=>{
    const users = await User.find({isAdmin:false})
    const wallet = await Wallet.find({})
    res.render("admin/wallet",{users,wallet})
}

const addWalletAmount = async (req,res)=>{

    const { email,amount } = req.body
    const users = req.session.user
    

    console.log("Email",email)
    console.log("Amount",amount)
    const userExist = await Wallet.findOne({userEmail:email})
    console.log(userExist)
    

    if(userExist){
        const dbAmount = parseInt(userExist.amount)
        const newAmount = parseInt(amount)+dbAmount
        console.log("Amount:",newAmount)
        await Wallet.updateOne({userEmail:email},{$set:{amount:newAmount}})
    }else {
        const newWallet = new Wallet({
            amount:amount,
            userEmail:email
        })
        await newWallet.save()
    }
   
    res.status(200).json({status:true})
   // res.redirect("/admin/wallet")

}

const deleteWallet = async (req,res)=>{
    try {
        const { walletId } = req.body
        console.log("Wallet id:",walletId)
         await Wallet.deleteOne({_id:walletId})
    
        res.status(200).json({status:true})
    } catch (error) {
        console.log(error)
        res.redirect("/pageerror")
    }
   
}




module.exports = { loadWalletPage,addWalletAmount,deleteWallet }
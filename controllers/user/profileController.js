const User = require("../../model/userSchema")
const Address = require("../../model/addressSchema")
const Wallet = require("../../model/walletSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const env = require("dotenv").config()
const session = require("express-session")
const { getCartAndWishlistData } = require("../../controllers/user/cartController")



function generateOtp (){
    const digits = "1234567890"
    let otp=""
    for(let i=0;i<6;i++){
        otp+=digits[Math.floor(Math.random()*10)]
    }
    return otp
}

const sendVerificationEmail = async (email,otp)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            service:"gmail",
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD,
            }
        })

        const mailOptions = {
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Your OTP for Password reset",
            text:`Your OTP is ${otp}`,
            html:`<b><h4>Your OTP : ${otp}</h4><br></b>`
        }

        const info = await transporter.sendMail(mailOptions)
        console.log("Email sent :",info.messageId)
        return true




    } catch (error) {
        console.error("Error sending Email",error)
        return false
    }
}

const securePassword = async (password)=>{
    const passwordHash = await bcrypt.hash(password,10)
    return passwordHash
}



const getForgotPasswordPage = (req,res)=>{
    try {
        res.render("user/forgot-password")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const forgotEmailValid = async (req,res)=>{
    try {
        const {email} = req.body
        const findUser = await User.findOne({email:email})
        if(findUser){
            const otp = generateOtp()
            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp
                req.session.email = email
                res.render("user/forgotpassword-otp")
                console.log("OTP : ",otp)
            } else {
                res.json({success:false, message:"Failed to send OTP. Please try again"})
            }
        } else {
            res.render("user/forgot-password",{
                message:"User with this email does not exist"
            })
        }
    } catch (error) {
        res.redirect("/pageerror")
    }
}

const verifyForgotPasswordOtp = async (req,res)=>{
    try {
        const enteredOtp = req.body.otp
        if(enteredOtp === req.session.userOtp){
            res.json({success:true,redirectUrl:"/reset-password"})
        }else {
            res.json({success:false,message:"OTP not Matching"})
        }



    } catch (error) {
        res.status(500).json({success:false,message:"An error occured. Please try again"})
    }
}


const getResetPasswordPage = async (req,res)=>{
try {
    res.render("user/reset-password")
} catch (error) {
    res.redirect("/pageNotFound")
}
}


const resendOtp1 = async (req,res)=>{
    try {
        const otp = generateOtp()
        req.session.userOtp = otp
        const email = req.session.email
        console.log("Resending OTP to email :",email)
        const emailSent = await sendVerificationEmail(email,otp)
        if(emailSent){
            console.log("Resend OTP :",otp)
            res.status(200).json({success:true, message:"Resend OTP Successful"})
        }



    } catch (error) {
        console.error("Error in resend otp",error)
        res.status(500).json({success:false,message:'Internal Server Error'})
    }
}


const postNewPassword = async (req,res)=>{
    try {
        const { newPass1, newPass2 } = req.body
        const email = req.session.email
        if(newPass1 === newPass2){
            const passwordHash = await securePassword(newPass1)
            await User.updateOne(
                {email:email},{$set:{password:passwordHash}}
            )
            res.redirect("/login")
        }else {
          res.render("user/reset-password",{message:'Passwords do not match'})  
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}

const userProfile = async (req,res)=>{
    try {
        const userId = req.session.user
        const { cartTotalQuantity, cartTotalAmount, wishlistCount } = await getCartAndWishlistData(userId);
        const userData = await User.findById(userId)
        console.log("Email",userData.email)
        const addressData = await Address.findOne({userId:userId})
        const walletAmount = await Wallet.findOne({userEmail:userData.email})
        res.render("user/profile",{user:userData,userAddress:addressData,walletAmount,totalQuantity:cartTotalQuantity,
            wishlistCount})

    } catch (error) {
        console.error("Error for Profile data",error)
        res.redirect("/pageNotFound")
    }
}


const changeEmail = async (req,res)=>{
    try {
        res.render("user/change-email")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const changeEmailValid = async (req,res)=>{
    try {
        const { email } = req.body
        const userExists = await User.findOne({email})
        if(userExists){

            const otp = generateOtp()
            const emailSent =await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp
                req.session.userData = req.body
                req.session.email = email
                res.render("user/change-email-otp")
                console.log("Email send:",email)
                console.log("OTP :",otp)
            }else {
                res.json("email-error")
            }
        }else {
            res.render("user/change-email",{message:"User with this email not exists"})
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const verifyEmailOtp = async (req,res)=>{
    try {
        
        const enteredOtp = req.body.otp
        if(enteredOtp === req.session.userOtp){
            req.session.userData = req.body.userData
            res.render("user/new-email",{userData:req.session.userData})
        }else {
            res.render("user/change-email-otp",{message:"OTP not Matching",userData:req.session.userData})
        }
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const updateEmail = async (req,res)=>{
    try {
        const {newEmail} = req.body
        const userId = req.session.user
        await User.findOneAndUpdate({ _id: userId }, { email: newEmail })
        res.redirect("/userProfile")


    } catch (error) {
        res.redirect("/pageNotFound")
        console.log(error)
    }
}



const changePassword = async (req,res)=>{

    try {
        res.render("user/change-password")
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const changePasswordValid = async (req,res)=>{

    try {
        const {email} = req.body
        const userExists = await User.findOne({email})
        if(userExists){
            const otp = generateOtp()
            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                req.session.userOtp = otp
                req.session.userData = req.body
                req.session.email = email
                res.render("user/change-password-otp")
                console.log("OTP:",otp)
            }else {
                res.json({
                    success:false,
                    message:"Failed to send OTP. Please try again."
                })
            }
        }else {
            res.render("user/change-password",{message:"User with this email doesnot exist"})
        }


    } catch (error) {
        console.log("Error in change password validation",error)
        res.redirect("/pageNotFound")
    }
}


const verifyChangePasswordOtp = async (req,res)=>{
    try {
        const enteredOtp = req.body.otp
        if(enteredOtp === req.session.userOtp){
           // res.json({success:true,redirectUrl:"/reset-password"})
           res.redirect("/reset-password")
        }else {
            res.json({success:false,message:"OTP not matching"})
        }
    } catch (error) {
        res.status(500).json({success:false,message:"An error occured. please try again Later"})
    }
}



const addAddress = async (req,res)=>{
    try {
        const user = req.session.user
        res.render("user/add-address",{user:user})



    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const postAddAddress = async (req,res)=>{
    try {
        const userId = req.session.user
        const userData = await User.findOne({_id:userId})
        const {addressType,name,city,landMark,state,pincode,phone,altPhone} = req.body

        const userAddress = await Address.findOne({userId:userData._id})
        if(!userAddress){
            const newAddress = new Address({
                userId:userData._id,
                address: [{addressType,name,city,landMark,state,pincode,phone,altPhone}]
            })
            await newAddress.save()
            res.status(200).json({status:true})
        } else {
            userAddress.address.push({addressType,name,city,landMark,state,pincode,phone,altPhone})
            await userAddress.save()
            res.status(200).json({status:true})
        }

        res.redirect("/userProfile")


    } catch (error) {
        console.error("Error adding Address :",error)
        res.redirect("/pageNotFound")
    }
}


const postAddAddress1 = async (req,res)=>{
    try {
        const userId = req.session.user
        const userData = await User.findOne({_id:userId})
        const {addressType,name,city,landMark,state,pincode,phone,altPhone} = req.body

        const userAddress = await Address.findOne({userId:userData._id})
        if(!userAddress){
            const newAddress = new Address({
                userId:userData._id,
                address: [{addressType,name,city,landMark,state,pincode,phone,altPhone}]
            })
            await newAddress.save()
            res.status(200).json({status:true})
        } else {
            userAddress.address.push({addressType,name,city,landMark,state,pincode,phone,altPhone})
            await userAddress.save()
            res.status(200).json({status:true})
        }

        //res.redirect("/userProfile")


    } catch (error) {
        console.error("Error adding Address :",error)
        res.redirect("/pageNotFound")
    }
}



const editAddress = async(req,res)=>{
    try {
        const addressId = req.query.id 
        const user = req.session.user
        const currAddress = await Address.findOne({
            "address._id":addressId
        })

        if(!currAddress){
            return res.redirect("/pageNotFound")
        }

        const addressData = currAddress.address.find((item)=>{
            return item._id.toString() === addressId.toString()
        })
        
        if(!addressData){
            return res.redirect("/pageNotFound")
        }

        res.render("user/edit-address",{address:addressData,user:user})

    } catch (error) {
        console.error("Error in edit Address",error)
        res.redirect("/pageNotFound")
    }
}


const postEditAddress = async (req,res)=>{
    try {
        const data = req.body
        const addressId =  req.query.id
        const user = req.session.user
        const findAddress = await Address.findOne({"address._id":addressId})
        if(!findAddress){
            res.redirect("/pageNotFound")
        }
        await Address.updateOne(
            {"address._id":addressId},
            {$set:{
                "address.$":{
                    _id:addressId,
                    addressType: data.addressType,
                    name:data.name,
                    city:data.city,
                    landMark:data.landMark,
                    state:data.state,
                    pincode:data.pincode,
                    phone:data.phone,
                    altPhone:data.altPhone,
                }
            }}
        )

        res.redirect("/userProfile")




    } catch (error) {
        console.error("Error in edit Address",error)
        res.redirect("/pageNotFound")
    }
}


const deleteAddress = async (req,res)=>{
    try {
        const addressId = req.query.id
        const findAddress = await Address.findOne({"address._id":addressId})
        if(!findAddress){
            return res.status(404).send("Address not found")
        }

        await Address.updateOne(
            {"address._id":addressId},
            {$pull:{
                address:{
                    _id:addressId,

                }
            }}
        )

        res.redirect("/userProfile")


    } catch (error) {
        console.error("Error in delete Address",error)
        res.redirect("/pageNotFound")
    }
}

module.exports = {
    getForgotPasswordPage,
    forgotEmailValid,
    verifyForgotPasswordOtp,
    getResetPasswordPage,
    resendOtp1,
    postNewPassword,
    userProfile,
    changeEmail,
    changeEmailValid,
    verifyEmailOtp,
    updateEmail,
    changePassword,
    changePasswordValid,
    verifyChangePasswordOtp,
    addAddress,
    postAddAddress,
    editAddress,
    postEditAddress,
    deleteAddress,
    postAddAddress1
}
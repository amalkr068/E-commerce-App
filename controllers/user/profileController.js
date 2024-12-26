const User = require("../../model/userSchema")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const env = require("dotenv").config()
const session = require("express-session")


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
        const userData = await User.findById(userId)
        res.render("user/profile",{user:userData})

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
    verifyChangePasswordOtp
}
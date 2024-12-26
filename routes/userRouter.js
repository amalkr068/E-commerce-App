const express = require("express")
const router = express.Router()
const passport = require('passport')
const { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login,logOut } = require("../controllers/user/userController")
const { getForgotPasswordPage,forgotEmailValid,verifyForgotPasswordOtp,getResetPasswordPage,resendOtp1,postNewPassword,userProfile,changeEmail,changeEmailValid,verifyEmailOtp,updateEmail,changePassword,changePasswordValid,verifyChangePasswordOtp } = require("../controllers/user/profileController")


//Error Management
router.get("/pageNotFound",pageNotFound)


//Sign Up Management
router.get("/signup",loadSignupPage)
router.post("/signup",signup)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)
router.get('/auth/google', passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback', passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})


//Log In Management
router.get("/login",loadLoginPage)
router.post("/login",login)


//Home page & shopping page
router.get("/", loadHomepage)
router.get("/logout",logOut)

//Profile Management
router.get("/forgot-password",getForgotPasswordPage)
router.post("/forgot-email-valid",forgotEmailValid)
router.post("/verify-passwordForgot-otp",verifyForgotPasswordOtp)
router.get("/reset-password",getResetPasswordPage)
router.post("/resend-forgot-otp",resendOtp1)
router.post("/reset-password",postNewPassword)
router.get("/userProfile",userProfile)
router.get("/change-email",changeEmail)
router.post("/change-email",changeEmailValid)
router.post("/verify-email-otp",verifyEmailOtp)
router.post("/update-email",updateEmail)
router.get("/change-password",changePassword)
router.post("/change-password",changePasswordValid)
router.post("/verify-changepassword-otp",verifyChangePasswordOtp)


module.exports = router;
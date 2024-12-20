const express = require("express")
const router = express.Router()
const passport = require('passport')
const { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login } = require("../controllers/user/userController")


router.get("/pageNotFound",pageNotFound)
router.get("/", loadHomepage)
router.get("/signup",loadSignupPage)
router.post("/signup",signup)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)
router.get("/login",loadLoginPage)
router.post("/login",login)

router.get('/auth/google', passport.authenticate('google',{scope:['profile','email']}))
router.get('/auth/google/callback', passport.authenticate('google',{failureRedirect:'/signup'}),(req,res)=>{
    res.redirect('/')
})


module.exports = router;
const express = require("express")
const router = express.Router()
const { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp } = require("../controllers/user/userController")


router.get("/pageNotFound",pageNotFound)
router.get("/", loadHomepage)
router.get("/signup",loadSignupPage)
router.post("/signup",signup)
router.post("/verify-otp",verifyOtp)
router.post("/resend-otp",resendOtp)


module.exports = router;
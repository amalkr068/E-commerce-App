const express = require("express")
const router = express.Router()
const passport = require('passport')
const { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login,logOut,loadShoppingPage,filterProduct,filterByPrice,searchProducts } = require("../controllers/user/userController")
const { getForgotPasswordPage,forgotEmailValid,verifyForgotPasswordOtp,getResetPasswordPage,resendOtp1,postNewPassword,userProfile,changeEmail,changeEmailValid,verifyEmailOtp,updateEmail,changePassword,changePasswordValid,verifyChangePasswordOtp,addAddress,postAddAddress,editAddress,postEditAddress,deleteAddress,postAddAddress1 } = require("../controllers/user/profileController")
const {productDetails} = require("../controllers/user/productController")
const { loadwishlist,addToWishlist,removeProduct, removeFromWishlist } = require("../controllers/user/wishlistController")
const { getCartPage,addToCart,changeQuantity,deleteProduct } = require("../controllers/user/cartController")
const { getCheckoutPage, placeOrder,orderConfirmation,verifyPayment,viewOrderList,viewOrderedProducts,returnProduct,applyCoupon,downloadInvoice,addReview } = require("../controllers/user/checkoutController")
const { getUserHelp } = require("../controllers/user/chatController")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage})




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
router.get("/shop",loadShoppingPage)
router.get("/filter",filterProduct)
router.get("/filterPrice",filterByPrice)
router.post("/search",searchProducts)

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


//Address Management
router.get("/addAddress",addAddress)
router.post("/addAddress",postAddAddress)
router.post("/addAddress1",postAddAddress1)
router.get("/editAddress",editAddress)
router.post("/editAddress",postEditAddress)
router.get("/deleteAddress",deleteAddress)


//Product Management
router.get("/productDetails",productDetails)


//Wishlist Management
router.get("/wishlist",loadwishlist)
router.post("/addToWishlist",addToWishlist)
router.get("/removeFromWishlist",removeFromWishlist)


//Cart Management
router.get("/cart",getCartPage)
router.post("/addToCart",addToCart)
router.post("/changeQuantity",changeQuantity)
router.get("/deleteItem",deleteProduct)

//Checkout Management
router.get("/checkout",getCheckoutPage)
router.post("/place-order",placeOrder)
router.get("/order-confirmation",orderConfirmation)
router.post("/order-confirmation",orderConfirmation)
router.post("/verify-payment",verifyPayment)
router.get("/view-order-list",viewOrderList)
router.get("/view-orderedproducts",viewOrderedProducts)
router.post("/applyCoupon",applyCoupon)
router.get("/downloadInvoice",downloadInvoice)
router.post("/addReview",uploads.single("image"),addReview)





//order management
router.post("/returnProduct",returnProduct)


//Chat Management
router.get("/help",getUserHelp)




module.exports = router;
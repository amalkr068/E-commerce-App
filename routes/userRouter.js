const express = require("express")
const router = express.Router()
const passport = require('passport')
const { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login,logOut,loadShoppingPage,filterProduct,filterByPrice,searchProducts,getContactPage,getAboutPage } = require("../controllers/user/userController")
const { getForgotPasswordPage,forgotEmailValid,verifyForgotPasswordOtp,getResetPasswordPage,resendOtp1,postNewPassword,userProfile,changeEmail,changeEmailValid,verifyEmailOtp,updateEmail,changePassword,changePasswordValid,verifyChangePasswordOtp,addAddress,postAddAddress,editAddress,postEditAddress,deleteAddress,postAddAddress1 } = require("../controllers/user/profileController")
const {productDetails} = require("../controllers/user/productController")
const { loadwishlist,addToWishlist,removeProduct, removeFromWishlist } = require("../controllers/user/wishlistController")
const { getCartPage,addToCart,changeQuantity,deleteProduct } = require("../controllers/user/cartController")
const { getCheckoutPage, placeOrder,orderConfirmation,verifyPayment,viewOrderList,viewOrderedProducts,returnProduct,applyCoupon,downloadInvoice,addReview } = require("../controllers/user/checkoutController")
const { getUserHelp } = require("../controllers/user/chatController")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage})
const { userAuth } = require("../middlewares/auth")



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
router.get("/logout",userAuth,logOut)
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
router.get("/userProfile",userAuth,userProfile)
router.get("/change-email",userAuth,changeEmail)
router.post("/change-email",userAuth,changeEmailValid)
router.post("/verify-email-otp",userAuth,verifyEmailOtp)
router.post("/update-email",userAuth,updateEmail)
router.get("/change-password",userAuth,changePassword)
router.post("/change-password",userAuth,changePasswordValid)
router.post("/verify-changepassword-otp",userAuth,verifyChangePasswordOtp)


//Address Management
router.get("/addAddress",userAuth,addAddress)
router.post("/addAddress",userAuth,postAddAddress)
router.post("/addAddress1",userAuth,postAddAddress1)
router.get("/editAddress",userAuth,editAddress)
router.post("/editAddress",userAuth,postEditAddress)
router.get("/deleteAddress",userAuth,deleteAddress)


//Product Management
router.get("/productDetails",productDetails)


//Wishlist Management
router.get("/wishlist",loadwishlist)
router.post("/addToWishlist",userAuth,addToWishlist)
router.get("/removeFromWishlist",userAuth,removeFromWishlist)


//Cart Management
router.get("/cart",getCartPage)
router.post("/addToCart",userAuth,addToCart)
router.post("/changeQuantity",userAuth,changeQuantity)
router.get("/deleteItem",userAuth,deleteProduct)

//Checkout Management
router.get("/checkout",userAuth,getCheckoutPage)
router.post("/place-order",userAuth,placeOrder)
router.get("/order-confirmation",userAuth,orderConfirmation)
router.post("/order-confirmation",userAuth,orderConfirmation)
router.post("/verify-payment",userAuth,verifyPayment)
router.get("/view-order-list",userAuth,viewOrderList)
router.get("/view-orderedproducts",userAuth,viewOrderedProducts)
router.post("/applyCoupon",userAuth,applyCoupon)
router.get("/downloadInvoice",userAuth,downloadInvoice)
router.post("/addReview",userAuth,uploads.single("image"),addReview)





//order management
router.post("/returnProduct",userAuth,returnProduct)


//Chat Management
router.get("/help",userAuth,getUserHelp)

router.get("/contact",getContactPage)
router.get("/about",getAboutPage)




module.exports = router;
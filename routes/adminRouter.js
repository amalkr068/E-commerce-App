const express = require("express")
const router = express.Router()
const { loadLogin,login,loadDashBoard,pageerror,logout } = require("../controllers/admin/adminController")
const { customerInfo,customerBlocked,customerUnblocked } = require("../controllers/admin/customerController")
const { categoryInfo,addCategory,addCategoryOffer,removeCategoryOffer,getListCategory,getUnListCategory,getEditCategory,editCategory } =  require("../controllers/admin/categoryController")
const { getBrandPage,addBrand,blockBrand,unBlockBrand,deleteBrand } = require("../controllers/admin/brandController")
const { getProductAddPage,addProducts,getAllProducts,addProductOffer,removeProductOffer,blockProduct,unblockProduct,getEditProduct,editProduct,deleteSingleImage } = require("../controllers/admin/productController")
const { getBannerPage,getAddBannerPage,addBanner,deleteBanner } = require("../controllers/admin/bannerController")
const { loadCoupon,createCoupon,editCoupon,updateCoupon,deleteCoupon } = require("../controllers/admin/couponController")
const {orderList,viewOrderedProducts,updateTracking,returnReply} = require("../controllers/admin/orderController")
const { loadWalletPage,addWalletAmount,deleteWallet } = require("../controllers/admin/walletController")
const { getAdminHelp } = require("../controllers/user/chatController")
const { getDashboard } = require("../controllers/admin/dashboardController")
const { adminAuth } = require("../middlewares/auth")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage})







// Log in Management
router.get("/login",loadLogin)
router.post("/login",login)
router.get("/",adminAuth,loadDashBoard)
router.get("/logout",adminAuth,logout)

// Customer Management
router.get("/users",adminAuth, customerInfo)
router.get("/blockCustomer",adminAuth, customerBlocked)
router.get("/unblockCustomer",adminAuth, customerUnblocked)

//category Management
router.get("/category",adminAuth,categoryInfo)
router.post("/addCategory",adminAuth,addCategory)
router.post("/addCategoryOffer",adminAuth,addCategoryOffer)
router.post("/removeCategoryOffer",adminAuth,removeCategoryOffer)
router.get("/listCategory",adminAuth,getListCategory)
router.get("/unlistCategory",adminAuth,getUnListCategory)
router.get("/editCategory",adminAuth,getEditCategory)
router.post("/editCategory/:id",adminAuth,editCategory)

//Brand Management
router.get("/brands",adminAuth,getBrandPage)
router.post("/addBrand",adminAuth,uploads.single("image"),addBrand)
router.get("/blockBrand",adminAuth,blockBrand)
router.get("/unBlockBrand",adminAuth,unBlockBrand)
router.get("/deleteBrand",adminAuth,deleteBrand)


//Product Management
router.get("/addProducts",adminAuth,getProductAddPage)
router.post("/addProducts",adminAuth,uploads.array("images",4),addProducts)
router.get("/products",adminAuth,getAllProducts)
router.post("/addProductOffer",adminAuth,addProductOffer)
router.post("/removeProductOffer",adminAuth,removeProductOffer)
router.get("/blockProduct",adminAuth,blockProduct)
router.get("/unblockProduct",adminAuth,unblockProduct)
router.get("/editProduct",adminAuth,getEditProduct)
router.post("/editProduct/:id",adminAuth,uploads.array("images",4),editProduct)
router.post("/deleteImage",adminAuth,deleteSingleImage)

//Banner Management
router.get("/banner",adminAuth,getBannerPage)
router.get("/addBanner",adminAuth,getAddBannerPage)
router.post("/addBanner",adminAuth,uploads.single("images"),addBanner)
router.get("/deleteBanner",adminAuth,deleteBanner)

//Coupon Management
router.get("/coupon",adminAuth,loadCoupon)
router.post("/createCoupon",adminAuth,createCoupon)
router.get("/editCoupon",adminAuth,editCoupon)
router.post("/updatecoupon",adminAuth,updateCoupon)
router.get("/deletecoupon",adminAuth,deleteCoupon)

//Order Management
router.get("/orderList",adminAuth,orderList)
router.get("/view-orderedproduct",adminAuth,viewOrderedProducts)
router.post("/updateTracking",adminAuth,updateTracking)
router.get("/returnReply",adminAuth,returnReply)


//Wallet Management
router.get("/wallet",adminAuth,loadWalletPage)
router.post("/addWalletAmount",adminAuth,addWalletAmount)
router.post("/deleteWallet",adminAuth,deleteWallet)


//Chat Management
router.get("/help",adminAuth,getAdminHelp)

//Dashboard Management
router.get("/dashboard",adminAuth,getDashboard)



router.get("/pageerror",pageerror)

module.exports = router;
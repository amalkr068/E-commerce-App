const express = require("express")
const router = express.Router()
const { loadLogin,login,loadDashBoard,pageerror,logout } = require("../controllers/admin/adminController")
const { customerInfo,customerBlocked,customerUnblocked } = require("../controllers/admin/customerController")
const { categoryInfo,addCategory,addCategoryOffer,removeCategoryOffer,getListCategory,getUnListCategory,getEditCategory,editCategory } =  require("../controllers/admin/categoryController")
const { getBrandPage,addBrand,blockBrand,unBlockBrand,deleteBrand } = require("../controllers/admin/brandController")
const { getProductAddPage,addProducts,getAllProducts,addProductOffer,removeProductOffer,blockProduct,unblockProduct } = require("../controllers/admin/productController")
const { adminAuth } = require("../middlewares/auth")
const multer = require("multer")
const storage = require("../helpers/multer")
const uploads = multer({storage:storage})






// Log in Management
router.get("/login",loadLogin)
router.post("/login",login)
router.get("/",adminAuth,loadDashBoard)
router.get("/logout",logout)

// Customer Management
router.get("/users", customerInfo)
router.get("/blockCustomer", customerBlocked)
router.get("/unblockCustomer", customerUnblocked)

//category Management
router.get("/category",categoryInfo)
router.post("/addCategory",addCategory)
router.post("/addCategoryOffer",addCategoryOffer)
router.post("/removeCategoryOffer",removeCategoryOffer)
router.get("/listCategory",getListCategory)
router.get("/unlistCategory",getUnListCategory)
router.get("/editCategory",getEditCategory)
router.post("/editCategory/:id",editCategory)

//Brand Management
router.get("/brands",getBrandPage)
router.post("/addBrand",uploads.single("image"),addBrand)
router.get("/blockBrand",blockBrand)
router.get("/unBlockBrand",unBlockBrand)
router.get("/deleteBrand",deleteBrand)


//Product Management
router.get("/addProducts",getProductAddPage)
router.post("/addProducts",uploads.array("images",4),addProducts)
router.get("/products",getAllProducts)
router.post("/addProductOffer",addProductOffer)
router.post("/removeProductOffer",removeProductOffer)
router.get("/blockProduct",blockProduct)
router.get("/unblockProduct",unblockProduct)



router.get("/pageerror",pageerror)

module.exports = router;
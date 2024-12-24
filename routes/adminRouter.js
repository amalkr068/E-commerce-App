const express = require("express")
const router = express.Router()
const { loadLogin,login,loadDashBoard,pageerror,logout } = require("../controllers/admin/adminController")
const { customerInfo,customerBlocked,customerUnblocked } = require("../controllers/admin/customerController")
const { categoryInfo,addCategory,addCategoryOffer,removeCategoryOffer,getListCategory,getUnListCategory,getEditCategory,editCategory } =  require("../controllers/admin/categoryController")
const { adminAuth } = require("../middlewares/auth")

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

router.get("/pageerror",pageerror)

module.exports = router;
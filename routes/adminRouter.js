const express = require("express")
const router = express.Router()
const { loadLogin,login,loadDashBoard,pageerror,logout } = require("../controllers/admin/adminController")
const { customerInfo,customerBlocked,customerUnblocked } = require("../controllers/admin/customerController")
const { categoryInfo,addCategory } =  require("../controllers/admin/categoryController")
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

router.get("/pageerror",pageerror)

module.exports = router;
const express = require("express")
const router = express.Router()
const { loadLogin,login,loadDashBoard,pageerror } = require("../controllers/admin/adminController")
const { adminAuth } = require("../middlewares/auth")


router.get("/login",loadLogin)
router.post("/login",login)
router.get("/",adminAuth,loadDashBoard)
router.get("/pageerror",pageerror)



module.exports = router;
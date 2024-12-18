const express = require("express")
const router = express.Router()
const { loadHomepage,pageNotFound,loadSignupPage,signup } = require("../controllers/user/userController")


router.get("/pageNotFound",pageNotFound)
router.get("/", loadHomepage)
router.get("/signup",loadSignupPage)
router.post("/signup",signup)


module.exports = router;
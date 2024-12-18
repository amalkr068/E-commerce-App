const express = require("express")
const router = express.Router()
const { loadHomepage,pageNotFound,loadSignupPage } = require("../controllers/user/userController")


router.get("/pageNotFound",pageNotFound)
router.get("/", loadHomepage)
router.get("/signup",loadSignupPage)


module.exports = router;
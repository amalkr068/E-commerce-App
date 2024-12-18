const express = require("express")
const router = express.Router()
const { loadHomepage,pageNotFound } = require("../controllers/user/userController")


router.get("/pageNotFound",pageNotFound)
router.get("/", loadHomepage)


module.exports = router;
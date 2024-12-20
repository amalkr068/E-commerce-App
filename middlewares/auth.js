const User = require("../model/userSchema")


const userAuth = (req,res,next)=>{
    if(req.session.user){
        User.findById(req.session.user)
        .then(data =>{
            if(data && !data.isBlocked){
                next()
            }else {
                return res.redirect("/login")
            }
        })
        .catch(error =>{
            console.log("Error in User Auth Middleware")
            res.status(500).send("Internal Server Error")
        })
    } else {
        return res.redirect("/login")
    }
}


const adminAuth = (req,res,next)=>{
    User.findOne({isAdmin:req.session.admin})
    .then(data =>{
        if(data){
            next()
        }else {
            res.redirect("/admin/login")
        }
    })
    .catch(error =>{
        console.log("Error in AdminAuth middleware")
        res.status(500).send("Internal Server Error")
    })
}



module.exports = { userAuth,adminAuth }
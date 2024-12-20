const User = require("../../model/userSchema")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")




const loadLogin = (req,res)=>{

    if(req.session.admin){
        return res.redirect("/admin")
    }

    res.render("admin/admin-login",{message:null})


}

const login = async (req,res)=>{
    try {
        const { email,password } = req.body
        const admin = await User.findOne({isAdmin:true,email})
        console.log(admin)

        if(admin){
            const passwordMatch = await bcrypt.compare(password,admin.password)

            if(passwordMatch){
                req.session.admin = true;
                return res.redirect("/admin")
            }else {
                return res.redirect("/login")
            }
        }else {
            return res.redirect("/login")
        }
        


    } catch (error) {
        console.log("login error",error)
        return res.redirect("/pageerror")
    }



}


const loadDashBoard = (req,res)=>{
    try {
        if(req.session.admin){
            return res.render("admin/dashboard")
        }

    } catch (error) {
        res.redirect("/pageerror")
    }
}

const pageerror = (req,res)=>{
    res.render("admin/page-error")
}

module.exports = { loadLogin,login,loadDashBoard,pageerror }
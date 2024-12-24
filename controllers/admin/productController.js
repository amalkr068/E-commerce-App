const Product = require("../../model/productSchema")
const Category = require("../../model/categorySchema")
const Brand = require("../../model/brandSchema")
const User = require("../../model/userSchema")
const fs = require("fs")
const path = require("path")
const sharp = require("sharp")




const getProductAddPage = async (req,res)=>{
    try {
    
        const category = await Category.find({isListed:true})
        const brand = await Brand.find({isBlocked:false})
        res.render("admin/product-add",{
            cat : category,
            brand:brand
        })
} catch (error) {
    res.redirect("/pageerror")
}
}





module.exports = { getProductAddPage }





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

const addProducts = async (req,res)=>{
    try {
        const products = req.body
        const productExists = await Product.findOne({
            productName:products.productName,
        })

        if(!productExists){
            const images = []

            if(req.files && req.files.length>0){
                for(let i=0;i<req.files.length;i++){
                    const originalImagePath = req.files[i].path

                    const resizedImagePath = path.join('public','uploads','product-images',req.files[i].filename)
                    await sharp (originalImagePath).resize({width:440,height:440}).toFile(resizedImagePath)
                    images.push(req.files[i].filename)
                }
            }
            const categoryId = await Category.findOne({name:products.category})
            if(!categoryId){
                return res.status(400).json("Invalid category name")
            }

            const newProduct = new Product({
                productName:products.productName,
                description:products.description,
                brand:products.brand,
                category:categoryId._id,
                regularPrice:products.regularPrice,
                salePrice:products.salePrice,
                createdOn:new Date(),
                quantity:products.quantity,
                size:products.size,
                color:products.color,
                productImage:images,
                status:"Available"

            })
            
            await newProduct.save()
            return res.redirect("/admin/addProducts")
        }else {
            return res.status(400).json("Product already exist,Please try with another name")
        }
    } catch (error) {
        console.error("Error saving Product:",error)
        return res.redirect("/admin/pageerror")
    }
}





module.exports = { getProductAddPage,addProducts }





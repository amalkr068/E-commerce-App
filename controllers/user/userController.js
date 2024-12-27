const User = require("../../model/userSchema")
const Product = require("../../model/productSchema")
const Category = require("../../model/categorySchema")
const Brand = require("../../model/brandSchema")
const Banner = require("../../model/bannerSchema")
const nodeMailer = require("nodemailer")
const bcrypt = require("bcrypt")


const pageNotFound = (req,res)=>{
    try{

        res.render("user/page-404")
    } catch(err){
        res.redirect('/pageNotFound')
    }
}

const loadSignupPage = (req,res)=>{

    try{
        res.render("user/signup");
    } catch(err) {
        console.log("Signup page not loading:",err)
        res.status(500).send("Server Error")
    }


}


function generateOtp  (){
    return Math.floor(100000+ Math.random()*900000).toString()
}

async function sendVerificationEmail (email,otp){

    try{
        const transporter = nodeMailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info = await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:"Verify Your Account",
            text:`Your OTP is ${otp}`,
            html:`<b>Your OTP : ${otp} </b>`
        })
        return info.accepted.length > 0
    } catch (err){
        console.error("Error sending Email :",err)
        return false
    }
}






const signup = async (req,res)=>{

    try{
       const { email,password,confirmPassword,fullName,phone } = req.body;

       if(password !== confirmPassword){
        return res.render("user/signup",{message:"Password do not Match....!!"})
       }

       const findUser = await User.findOne({email})
       //console.log(findUser)
       if(findUser){
        return res.render("user/signup",{message:"User Already Exists....!!!"})
       }

       const otp = await generateOtp ()
       console.log(otp)
       const emailSent = await sendVerificationEmail(email,otp)

       if(!emailSent){
        return res.json("email-Error")
       }
       req.session.userOtp = otp
       req.session.userData = { email,password,fullName,phone }
       //const man = await User.find({ googleId: null });
       //console.log(man)


       res.render("user/otp-verification")
      // console.log("OTP sent",otp)



    }
    catch(err){
        console.error("signup Error :",err)
        res.redirect("/user/page-404")
    }
}

async function securePassword (password){
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch(err){

    }
}

const verifyOtp = async (req,res)=>{
    
        try {
          const { otp } = req.body;
          
      
          // Check if OTP matches the one stored in session
          if (req.session.userOtp === otp) {
            const user = req.session.userData;
            const passwordHash = await bcrypt.hash(user.password, 10);
      
            // Save user to DB
            const saveUserData = new User({
              fullName: user.fullName,
              email: user.email,
              phone: user.phone,
              password: passwordHash,
            });
      
            await saveUserData.save();
      
            // Clear OTP and session user data after registration
            req.session.userOtp = null;
            req.session.userData = null;
      
            res.json({ success: true, redirectUrl: '/' });
          } else {
            res.status(400).json({ success: false, message: 'Invalid OTP, please try again.' });
          }
        } catch (err) {
          console.error('Error verifying OTP:', err);
          res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
        }
      
    }


    const resendOtp = async (req,res)=>{
        try {
            const {email} = req.session.userData
            if(!email){
                return res.status(400).json({success:false,message:"Email not found in session"})
            }

            const otp = generateOtp()
            req.session.userOtp = otp

            const emailSent = await sendVerificationEmail(email,otp)
            if(emailSent){
                console.log("Resend otp",otp)
                res.status(200).json({success:true,message:"OTP Resend Successfully"})

            }else {
                res.status(500).json({success:false,message:"Failed to resend OTP. Please try again"})
            }
        } catch(err){
            console.error("Error resending OTP",err)
            res.status(500).json({success:false,message:"Internal server Error. Please try again"})
        }
    }


const loadHomepage = async (req,res)=>{

try{
    const today = new Date().toISOString()
    const findBanner = await Banner.find({
        startDate:{$lt:new Date(today)},
        endDate:{$gt:new Date(today)}
    })
    const user = req.session.user
    const categories = await Category.find({isListed:true})
    let productData = await Product.find({
        isBlocked:false,
        category:{$in:categories.map(category=>category._id)},quantity:{$gt:0}
    })

    productData.sort((a,b)=> new Date(b.createdOn) - new Date(a.createdOn))
    productData = productData.slice(0,4)
    //console.log(user)
    if(user){
        const userData = await User.findOne({_id:user})
       // console.log("iam amal :",userData)
        return res.render("user/home",{user:userData , products:productData,banner:findBanner || []})
    }else {
       return res.render("user/home",{user:null , products:productData,banner:findBanner || []})
    }

   // res.render('user/home')
} catch (err){
    console.log("Home page not found")
    res.status(500).send("server Error")
}

}


const loadLoginPage = (req,res)=>{
    try{
        if(!req.session.user){
            res.render("user/login")
        }else {
            res.redirect("/")
        }
    } catch(err){
        res.redirect("user/pageNotFound")
    }
}


const login = async (req,res)=>{

    try{
        const { email,password } = req.body
       // console.log(password)
        const findUser = await User.findOne({isAdmin:0,email:email})
        //console.log(findUser)

        if(!findUser){
            return res.render("user/login",{message:"User not found....!!!"})
        }
        if(findUser.isBlocked){
            return res.render("user/login",{message:"User is Blocked by Admin"})
        }
        const passwordMatch = await bcrypt.compare(password,findUser.password)

        if(!passwordMatch){
            return res.render("user/login",{message:"Incorrect Password"})
        }

        req.session.user = findUser._id
        res.redirect("/")


    } catch (err){
        console.error("login error :",err)
        res.render("user/login",{message: "Log in failed . Please try again later"})

    }
}


const logOut = (req,res)=>{
    try {
        
        req.session.destroy((err)=>{
            if(err){
                console.log("Session Destruction Error",err.message)
                return res.redirect("/pageNotFound")
            }
            return res.redirect("/login")
        })
    } catch (error) {
        console.log("Logout error",error)
        res.redirect("/pageNotFound")
        
    }
}


const loadShoppingPage = async(req,res)=>{
    try {

        const user = req.session.user
        const userData = await User.findOne({_id:user})
        const categories = await Category.find({isListed:true})
        const categoryIds = categories.map((category)=>category._id.toString())
        const page = parseInt(req.query.page) || 1
        const limit = 9
        const skip = (page-1)*limit
        const products = await Product.find({
            isBlocked:false,
            category:{$in:categoryIds},
            quantity:{$gt:0}
        }).sort({createdOn:-1}).skip(skip).limit(limit)

        const totalProducts = await Product.countDocuments({
            isBlocked:false,
            category:{$in:categoryIds},
            quantity:{$gt:0}
        })
        const totalPages = Math.ceil(totalProducts/limit)

        const brands = await Brand.find({isBlocked:false})
        const categoriesWithIds = categories.map(category=>({_id:category._id,name:category.name}))


        res.render("user/shop",{
            user:userData,
            products:products,
            category:categoriesWithIds,
            brand:brands,
            totalProducts:totalProducts,
            currentPage:page,
            totalPages:totalPages
        })
    } catch (error) {
        res.redirect("/pageNotFound")
    }
}



const filterProduct = async (req,res)=>{
    try {
        
        const user = req.session.user
        const category = req.query.category
        const brand = req.query.brand
        const findCategory = category ? await Category.findOne({_id:category}) : null
        const findBrand = brand ? await Brand.findOne({_id:brand}) : null
        const brands = await Brand.find({}).lean()
        const query = {
            isBlocked:false,
            quantity:{$gt:0}
        }

           if(findCategory){
            query.category = findCategory._id

           } 

           if(findBrand){
            query.brand = findBrand.brandName
           }

           let findProducts = await Product.find(query).lean()
           findProducts.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn))

           const categories = await Category.find({isListed:true})

           let itemsPerPage = 6

           let currentPage =parseInt(req.query.page) || 1
           let startIndex = (currentPage-1)*itemsPerPage
           let endIndex = startIndex+itemsPerPage
           let totalPages = Math.ceil(findProducts.length/itemsPerPage)
           const currentProduct = findProducts.splice(startIndex,endIndex)

           let userData = null
           if(user){
            const searchHistory = {
                category : findCategory ? findCategory._id : null,
                brand : findBrand ? findBrand._id : null,
                searchedOn : new Date()
            }
            userData.searchHistory.push(searchEntry)
            await userData.save()
           }

           req.session.filteredProducts = currentProduct
           res.render("user/shop",{
            user:userData,
            products:currentProduct,
            category:categories,
            brand:brands,
            totalPages,
            currentPage,
            selectedCategory:category || null,
            selectedBrand:brand || null
           })

    } catch (error) {
        res.redirect("/pageNotFound")
    }
}


const filterByPrice = async (req,res)=>{
    try {
        const user = req.session.user
        const userData =await User.findOne({_id:user})
        const brands = await Brand.find({}).lean()
        const categories = await Category.find({isListed:true}).lean()

        let findProducts = await Product.find({
            salePrice: {$gt:req.query.gt,$lt:req.query.lt},
            isBlocked:false,
            quantity:{$gt:0}
        }).lean()

        findProducts.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn))

        let itemsPerPage =6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)*itemsPerPage
        let endIndex = startIndex+itemsPerPage
        let totalPages = Math.ceil(findProducts.length/itemsPerPage)
        const currentProduct = findProducts.slice(startIndex,endIndex)
        req.session.filteredProducts = findProducts

        res.render("user/shop",{
            user:userData,
            products:currentProduct,
            category:categories,
            brand:brands,
            totalPages,
            currentPage
        })


    } catch (error) {
        console.log(error)
        res.redirect("/pageNotFound")
    }
}



const searchProducts = async (req,res)=>{
     try {
        
        const user = req.session.user
        const userData = await User.findOne({_id:user})
        let search = req.body.query

        const brands = await Brand.find({}).lean()
        const categories = await Category.find({isListed:true}).lean()
        const categoryIds = categories.map(category=>category._id.toString())
        let searchResult = []
        if(req.session.filteredProducts && req.session.filteredProducts.length>0){
            searchResult = req.session.filteredProducts.filter(product=>
                product.productName.toLowerCase().includes(search.toLowerCase())
            )
        }else {
            searchResult = await Product.find({
                productName : {$regex : ".*"+search+".*",$options:"i"},
                isBlocked:false,
                quantity:{$gt:0},
                category:{$in:categoryIds}
            })


        }

        searchResult.sort((a,b)=>new Date(b.createdOn)-new Date(a.createdOn))
        let itemsPerPage = 6
        let currentPage = parseInt(req.query.page) || 1
        let startIndex = (currentPage-1)*itemsPerPage
        let endIndex = startIndex+itemsPerPage
        let totalPages = Math.ceil(searchResult.length/itemsPerPage)
        const currentProduct = searchResult.slice(startIndex,endIndex)


        res.render("user/shop",{
            user:userData,
            products:currentProduct,
            category:categories,
            brand:brands,
            totalPages,
            currentPage,
            count:searchResult.length
        })




    } catch (error) {
        console.log("Error :",error)
        res.redirect("/pageNotFound")
    }
}


module.exports = { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login,logOut,loadShoppingPage,filterProduct,filterByPrice,searchProducts }
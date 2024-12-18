const User = require("../../model/userSchema")


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

const signup = (req,res)=>{

    try{
        const { fullName,email,password,confirmPassword,phone } = req.body;
        const newUser = new User({fullName,email,password,phone})
        console.log(newUser)
        newUser.save()


    }
    catch(err){
        console.error("Error :",err)
        res.status(500).send("Error in signup")
    }
}



const loadHomepage = (req,res)=>{

try{

    res.render('user/home')
} catch (err){
    console.log("Home page not found")
    res.status(500).send("server Error")
}

}


module.exports = { loadHomepage,pageNotFound,loadSignupPage,signup  }
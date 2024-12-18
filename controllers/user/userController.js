
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



const loadHomepage = (req,res)=>{

try{

    res.render('user/home')
} catch (err){
    console.log("Home page not found")
    res.status(500).send("server Error")
}

}


module.exports = { loadHomepage,pageNotFound,loadSignupPage  }
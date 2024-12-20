const User = require("../../model/userSchema")
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


const loadHomepage = (req,res)=>{

try{

    res.render('user/home')
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
        console.log(password)
        const findUser = await User.findOne({isAdmin:0,email:email})
        console.log(findUser)

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


module.exports = { loadHomepage,pageNotFound,loadSignupPage,signup,verifyOtp,resendOtp,loadLoginPage,login  }
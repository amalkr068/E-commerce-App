const express = require('express')
const app = express()
const env = require('dotenv').config()
const session = require("express-session")
const swal = require("sweetalert")
const { connectDB } = require('./config/db')
const  userRouter  = require('./routes/userRouter')
const adminRouter = require("./routes/adminRouter")
const passport = require("./config/passport")
const http = require('http');  // Import HTTP to create server
const { io } = require('./controllers/user/socket');








app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))

app.use(passport.initialize())
app.use(passport.session())

/*app.use(async (req, res, next) => {
    if (req.session.user) {
        const cart = await Cart.findOne({ userId: req.session.user });
        let totalQuantity = 0;
        if (cart && cart.items) {
            totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
        }
        res.locals.totalQuantity = totalQuantity;  // Pass totalQuantity globally to all views
    }
    next();
});*/


app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})



app.set("view engine","ejs")
app.use(express.static('public'))


app.use('/',userRouter)
app.use("/admin",adminRouter)




// Create the HTTP server
const server = http.createServer(app); // Pass express app to http server
// Pass the server to Socket.IO
io.attach(server);




    connectDB().then(()=>{
        server.listen(process.env.PORT || 3002 ,()=>{
            console.log(`Server started in ${process.env.PORT}`)
        })
    })
    .catch((err)=>{
        console.log("Error",err.message)
    })

module.exports = { app }





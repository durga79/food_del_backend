import express from "express"
import cors from "cors"
import { connect } from "mongoose"
import { connectDB } from "./config/db.js"
import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import 'dotenv/config'
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"







//app config
const app=express()
const port=4000 || process.env.PORT



//middleware
app.use(express.json())
app.use(cors())


//db connection
connectDB();


//Api endpoints
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)


app.get("/",(req,res)=>{
     res.send("Welcome to food delivery")
})



app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`)
})


//mongodb+srv://greaterstack:Nani123@cluster0.vxzisn4.mongodb.net/?
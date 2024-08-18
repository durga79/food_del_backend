import mongoose from "mongoose";


export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://greaterstack:Nani123@cluster0.vxzisn4.mongodb.net/food-del').then(()=>console.log("database connected"));
}
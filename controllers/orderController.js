// import { response } from "express";
// import orderModel from "../models/orderModel.js";
// import userModel from "../models/userModel.js";
// import Stripe from "stripe";




// const stripe =new Stripe(process.env.STRIPE_SECRET_KEY)

// //placing user order 

// const placeOrder=async (req,res)=>{

//     //const frontend_url="http://localhost:5173"
//     const frontend_url="food-delivery-app-d47h-36v3kepuj-durga79s-projects.vercel.app"
    
//     try {
//         const newOrder=new orderModel({
//             userId:req.body.userId,
//             items:req.body.items,
//             amount:req.body.amount,
//             address:req.body.address
//         })
//      await newOrder.save();
//      await userModel.findByIdAndUpdate(req.body.userId,{cartData:{}});

//       const line_items=req.body.items.map((item)=>({
//          price_data:{
//             currency:"inr",
//             product_data:{
//                 name:item.name
//             },
//             unit_amount:item.price*100*80
//          },
//          quantity:item.quantity
//       }))

//       line_items.push({
//         price_data:{
//             currency:"inr",
//             product_data:{
//                 name:"Delivery Charges"
//             },
//             unit_amount:2*100*80
//         },
//         quantity:1
//       })

//       const session=await stripe.checkout.sessions.create({
//         line_items:line_items,
//         mode:'payment',
//         success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
//         cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
//       })

//       res.json({success:true,session_url:session.url})
    
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:`${error}`})
//     }
// }

// const verifyOrder=async(req,res)=>{
//     const {orderId,success}=req.body;
//     try {
//          if(success==="true")
//          {
//              await orderModel.findByIdAndUpdate(orderId,{payment:true});
//              res.json({success:true,message:"Paid"});
//          }
//          else{
//             await orderModel.findByIdAndDelete(orderId);
//             res.json({success:false,message:"Not paid"});
//          }
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:`${error}`});
//     }
// } 


// //users orders to display on frontend
// const userOrders=async(req,res)=>{
//    try {
//       const orders=await orderModel.find({userId:req.body.userId});
//       if (orders.length === 0) {
//         return res.json({ success: true, data: [], message: "No orders found for this user."});
//       }
      
//       res.json({success:true,data:orders})
//    } catch (error) {
//      console.log(error);
//      res.json({success:false,message:`${error}`})
//    }
// }


// //list all orders for admin panel

// const listOrders=async (req,res)=>{
//    try {
//      const orders=await orderModel.find({});
//      res.json({success:true,data:orders})
//    } catch (error) {
//     console.log(error);
//     res.json({success:false,message:`${error}`})
//    }
// }
 
// //api for updating order status

// const updateStatus=async (req,res)=>{
//    try {
//       await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
//       res.json({success:true,message:"Status Updated"})
//    } catch (error) {
//      console.log(error);
//      res.json({success:false,message:`${error}`})
//    }
// }  

// export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}
import { response } from "express";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order
const placeOrder = async (req, res) => {
    const frontend_url = "https://food-delivery-app-d47h-36v3kepuj-durga79s-projects.vercel.app";

    try {
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
        });
        await newOrder.save();

        // Clear user's cart after placing the order
        await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

        // Prepare line items for Stripe Checkout
        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                },
                unit_amount: item.price * 100*80, // Price in paise (INR's smallest unit)
            },
            quantity: item.quantity,
        }));

        // Add delivery charges as a separate line item
        line_items.push({
            price_data: {
                currency: "inr",
                product_data: {
                    name: "Delivery Charges",
                },
                unit_amount: 200*80, // Example: 2 INR in paise
            },
            quantity: 1,
        });

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verifying the order payment status
const verifyOrder = async (req, res) => {
    const { orderId, success } = req.body;
    try {
        if (success === "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Payment successful" });
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({ success: false, message: "Payment failed, order cancelled" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fetch user-specific orders to display on the frontend
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });
        if (orders.length === 0) {
            return res.json({ success: true, data: [], message: "No orders found for this user." });
        }
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// List all orders for the admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update the status of an order (e.g., Shipped, Delivered)
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
        res.json({ success: true, message: "Order status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };

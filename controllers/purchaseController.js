const Razorpay = require("razorpay");
const crypto = require("crypto")
const purchaseModel = require("../models/purchaseModel");
const userModel = require("../models/userModel");

// env config
require('dotenv').config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// create payment order
const createPaymentOrder = async (req, res) => {
    console.log("Purchase course route hit");
    const { courseId, userId, amount } = req.body;

    if (!courseId || !userId || !amount) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
        const order = await razorpayInstance.orders.create({
            amount: amount * 100, // Amount in paisa (₹1 = 100 paisa)
            currency: "INR",
            receipt: `order_rcpt_${Date.now()}`,
        })

        const purchase = new purchaseModel({ courseId, userId, amount, status: 'pending', paymentId: order.id })
        await purchase.save()

        return res.status(200).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        console.error("Error creating Razorpay order", error);
        return res.status(500).json({ success: false, message: "Error creating Razorpay order", error });
    }
}

// verify razorpay payment
const verifyRazorpay = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    console.log("Request Body:", req.body);

    try {
        console.log("Razorpay Key Secret:", process.env.RAZORPAY_KEY_SECRET);
        // Generate the expected signature
        const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generatedSignature = hmac.digest("hex");

        console.log("Generated Signature:", generatedSignature); // Log the generated signature
        console.log("Provided Signature:", razorpay_signature); // Log the provided signature

        if (generatedSignature === razorpay_signature) {
            // Update purchase status in the database
            const purchase = await purchaseModel.findOneAndUpdate(
                { paymentId: razorpay_order_id },
                { status: "completed" },
                { new: true }
            )

            if (!purchase) {
                console.log("Purchase not found for order_id:", razorpay_order_id);
                return res.status(404).json({ success: false, message: "Purchase not found" });
            }

            // Update user's purchased courses
            const user = await userModel.findById(purchase.userId);

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            if (!user.enrolledCourses.includes(purchase.courseId)) {
                user.enrolledCourses.push(purchase.courseId);
                await user.save();
            }

            console.log("Payment verified successfully and course added to user", purchase, user);
            return res.status(200).json({ success: true, message: "Payment verified successfully", purchase });
        } else {
            console.log("Signature mismatch");
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Error verifying payment", error });
    }
}

module.exports = { createPaymentOrder, verifyRazorpay }

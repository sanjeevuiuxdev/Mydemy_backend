const express = require("express")
const { createPaymentOrder, verifyRazorpay } = require("../controllers/purchaseController")
const router = express.Router()


router.post('/purchase-course',createPaymentOrder)
router.post('/verify-payment',verifyRazorpay)

module.exports = router
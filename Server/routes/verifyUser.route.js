const express = require('express');
const router = express.Router();
const transporter = require('../utils/mailer');
const crypto = require('crypto');

router.post('/send-otp/', async (req, res) => {
    const { email } = req.body;
    // console.log("Email",email);
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    const generateOTP = () => {
        return crypto.randomInt(100000, 999999).toString();
    }
    const OTP = generateOTP();
    req.session.email = email;
    req.session.otp = OTP;
    // console.log(req.session,req.sessionID);
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email for SmartSplit",
        html: `<h3>Welcome to SmartSplit!</h3>
               <p>Thank you for signing up. Here is your OTP for login !!!</p>
               <h4>${OTP}</h4>`,
    }
    try{
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message : "Email Sent Successfully"});
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ message: 'Error sending verification email.' });
    }
})
router.post('/verify-otp',async(req,res)=>
{
    const {enteredOtp} = req.body;
    // console.log(email,enteredOtp);
    // console.log(req.session,req.sessionID);   
    if(req.session.otp && req.session.otp === enteredOtp)
    {
        res.status(200).json({ message: 'OTP verified successfully.' });
    }
    else{
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
});
module.exports = router;
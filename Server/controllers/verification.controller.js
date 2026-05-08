const transporter = require('../utils/mailer');
const crypto = require('crypto');

exports.sendOtp = async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    const generateOTP = () => {
        return crypto.randomInt(100000, 999999).toString();
    }
    const OTP = generateOTP();
    req.session.email = email;
    req.session.otp = OTP;
    
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
};

exports.verifyOtp = async (req, res) => {
    const {enteredOtp} = req.body;
    if(req.session.otp && req.session.otp === enteredOtp)
    {
        res.status(200).json({ message: 'OTP verified successfully.' });
    }
    else{
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
};

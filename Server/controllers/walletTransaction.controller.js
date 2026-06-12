const walletTransaction = require('../models/wallet.model');
const User = require('../models/user.model');
const Settlement = require('../models/settleUp.model');

exports.getWalletTransactions = async(req, res)=>
{
    try{
        const userId = req.user._id;
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({message: 'User not found.'});
        const transactions = await walletTransaction.find({userID: userId}).sort({createdAt: -1}).populate('relatedUser','name');
        res.status(200).json({transactions});
    }
    catch(err){
        console.error('getWalletTransactions error:', err);
        res.status(500).json({message: 'Server error.'});
    }
};

exports.topUp = async(req,res)=>{
    try{
        const {amount} = req.body;
        if(!amount || amount <= 0) return res.status(400).json({message: 'Invalid amount.'});
        const user = await user.findByIdAndUpdate(
            req.user._id,
            {$inc: {walletBalance: amount}},
            {new: true}

        );
        await walletTransaction.create({
            userID: req.user._id,
            type: 'top-up',
            amount, 
            relatedUser: null,
            discription: `Wallet top-up of $${amount}`
        });
        res.status(200).json({message: 'Wallet topped up successfully.', walletBalance: user.walletBalance});
    }catch(err){
        console.error('topUp error:', err);
        res.status(500).json({message: 'Server error.'});
    }
}


exports.getSettlements = async(req, res)=>
{
    try{    
        const {SettlementID} = req.body;

        const settlement = await Settlement.findById(SettlementID).populate('to from');
        if(!settlement) return res.status(404).json({message: 'Settlement not found.'});
        if(settlement.from._id.toString() !== req.user._id.toString() && settlement.to._id.toString() !== req.user._id.toString()){
            return res.status(403).json({message: 'Unauthorized.'});
        }

        const payer = await User.findById(req.user._id);
        if(payer.walletBalance < settlement.amount) 
            return res.status(400).json({message: 'Insufficient balance.'});

        await User.findByIdAndUpdate(payer._id, {$inc: {walletBalance: -settlement.amount}});
        await User.findByIdAndUpdate(settlement.to._id, {$inc: {walletBalance: settlement.amount}});

        settlement.status = 'completed';
        await settlement.save();

        await walletTransaction.create([
            {userId:payer._id,type:'debit',amount:settlement.amount,relatedUser:settlement.to._id,discription:`Settlement payment to ${settlement.to.name}`},
            {userId:settlement.to._id,type:'credit',amount:settlement.amount,relatedUser:payer._id,discription:`Settlement received from ${payer.name}`}
        ]);

        res.status(200).json({message: 'Settlement completed successfully via wallet.'});
    }
    catch(err){
        console.error('getSettlements error:', err);
        res.status(500).json({message: 'Server error.'});
    }       
};
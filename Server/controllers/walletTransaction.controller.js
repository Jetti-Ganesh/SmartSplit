const WalletTransaction = require('../models/wallet.model');
const User = require('../models/user.model');
const Settlement = require('../models/settleUp.model');

// Fetch wallet transactions for current user
exports.getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const transactions = await WalletTransaction.find({ userID: userId })
      .sort({ createdAt: -1 })
      .populate('relatedUser', 'name email');

    res.status(200).json({ transactions });
  } catch (err) {
    console.error('getWalletTransactions error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Top up user wallet
exports.topUp = async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: numAmount } },
      { new: true }
    );

    await WalletTransaction.create({
      userID: req.user._id,
      transactionType: 'credit',
      amount: numAmount,
      relatedUser: null,
      description: `Wallet top-up of ₹${numAmount.toLocaleString('en-IN')}`
    });

    res.status(200).json({
      message: 'Wallet topped up successfully.',
      walletBalance: user.walletBalance
    });
  } catch (err) {
    console.error('topUp error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Settle group debt using wallet (supports both SettlementID or direct groupId + to + amount)
exports.getSettlements = async (req, res) => {
  try {
    const { SettlementID, groupId, to, amount } = req.body;
    
    let settlementAmount;
    let recipientId;
    let settlementDoc = null;
    let recipientUser = null;

    if (SettlementID) {
      const settlement = await Settlement.findById(SettlementID).populate('to from');
      if (!settlement) return res.status(404).json({ message: 'Settlement not found.' });

      // Verify current user is the payer ('from')
      if (settlement.from._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized. You are not the payer of this settlement.' });
      }

      if (settlement.status === 'completed') {
        return res.status(400).json({ message: 'This settlement is already completed.' });
      }

      settlementAmount = settlement.amount;
      recipientId = settlement.to._id;
      recipientUser = settlement.to;
      settlementDoc = settlement;
    } else {
      if (!groupId || !to || !amount) {
        return res.status(400).json({ message: 'Settlement ID or (groupId, to, amount) are required.' });
      }
      settlementAmount = Number(amount);
      if (isNaN(settlementAmount) || settlementAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount.' });
      }
      recipientId = to;
      recipientUser = await User.findById(to);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient user not found.' });
      }
      if (recipientId.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot pay yourself.' });
      }
    }

    const payer = await User.findById(req.user._id);
    const payerBalance = payer.walletBalance || 0;
    if (payerBalance < settlementAmount) {
      return res.status(400).json({ message: 'Insufficient balance. Please top up your wallet.' });
    }

    // Transfer wallet balance
    const updatedPayer = await User.findByIdAndUpdate(payer._id, { $inc: { walletBalance: -settlementAmount } }, { new: true });
    await User.findByIdAndUpdate(recipientId, { $inc: { walletBalance: settlementAmount } });

    // Update or Create Settlement Document
    if (settlementDoc) {
      settlementDoc.status = 'completed';
      settlementDoc.method = 'wallet';
      await settlementDoc.save();
    } else {
      settlementDoc = await Settlement.create({
        groupId,
        from: payer._id,
        to: recipientId,
        amount: settlementAmount,
        method: 'wallet',
        status: 'completed',
        notes: `Settled via Wallet`,
        settledAt: new Date()
      });
    }

    // Create wallet transactions for both users
    await WalletTransaction.create([
      {
        userID: payer._id,
        transactionType: 'debit',
        amount: settlementAmount,
        relatedUser: recipientId,
        description: `Settlement payment to ${recipientUser.name}`
      },
      {
        userID: recipientId,
        transactionType: 'credit',
        amount: settlementAmount,
        relatedUser: payer._id,
        description: `Settlement received from ${payer.name}`
      }
    ]);

    res.status(200).json({
      message: 'Settlement completed successfully via wallet.',
      walletBalance: updatedPayer.walletBalance
    });
  } catch (err) {
    console.error('getSettlements error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Withdraw wallet balance to external bank/UPI (Simulated)
exports.withdraw = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Invalid amount.' });
    }
    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required for withdrawal.' });
    }

    const user = await User.findById(req.user._id);
    const userBalance = user.walletBalance || 0;
    if (userBalance < numAmount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Deduct balance
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { walletBalance: -numAmount } },
      { new: true }
    );

    // Record withdrawal transaction
    await WalletTransaction.create({
      userID: req.user._id,
      transactionType: 'debit',
      amount: numAmount,
      relatedUser: null,
      description: `Wallet withdrawal of ₹${numAmount.toLocaleString('en-IN')} to ${upiId}`
    });

    res.status(200).json({
      message: 'Withdrawal completed successfully.',
      walletBalance: updatedUser.walletBalance
    });
  } catch (err) {
    console.error('withdraw error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Send money peer-to-peer (P2P) by user email or phone
exports.sendMoney = async (req, res) => {
  try {
    const { email, amount } = req.body;
    const numAmount = Number(amount);
    if (!email || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Invalid recipient or amount.' });
    }

    const recipientSearch = email.toLowerCase().trim();
    const isEmail = recipientSearch.includes('@');
    let query = {};
    if (isEmail) {
      query = { email: recipientSearch };
    } else {
      // Clean phone format
      const cleanPhone = recipientSearch.replace(/\s+/g, '').replace(/^(\+91|0)/, '');
      query = { phone: cleanPhone };
    }

    const receiver = await User.findOne(query);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver user not found.' });
    }

    if (receiver._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send money to yourself.' });
    }

    const sender = await User.findById(req.user._id);
    const senderBalance = sender.walletBalance || 0;
    if (senderBalance < numAmount) {
      return res.status(400).json({ message: 'Insufficient balance.' });
    }

    // Transfer wallet balance
    const updatedSender = await User.findByIdAndUpdate(sender._id, { $inc: { walletBalance: -numAmount } }, { new: true });
    await User.findByIdAndUpdate(receiver._id, { $inc: { walletBalance: numAmount } });

    // Record transactions for both users
    await WalletTransaction.create([
      {
        userID: sender._id,
        transactionType: 'debit',
        amount: numAmount,
        relatedUser: receiver._id,
        description: `Sent money to ${receiver.name}`
      },
      {
        userID: receiver._id,
        transactionType: 'credit',
        amount: numAmount,
        relatedUser: sender._id,
        description: `Received money from ${sender.name}`
      }
    ]);

    res.status(200).json({
      message: 'Money transferred successfully.',
      walletBalance: updatedSender.walletBalance
    });
  } catch (err) {
    console.error('sendMoney error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
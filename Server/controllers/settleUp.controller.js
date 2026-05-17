const Settlement = require('../models/settleUp.model');
const Group = require('../models/group.model');
const Expense = require('../models/expense.model');
const User = require('../models/user.model');

// Get all balances in a group
exports.getGroupBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Verify user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const isMember = group.members.some(
      m => m.userId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group'
      });
    }
    
    // Calculate all balances
    const balances = await calculateAllBalances(groupId);
    
    // Get settlement history
    const settlements = await Settlement.find({ groupId })
      .populate('from to', 'name')
      .sort({ settledAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: {
        balances,
        settlements,
        group: {
          _id: group._id,
          name: group.name,
          icon: group.icon
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Record a settlement
exports.recordSettlement = async (req, res, next) => {
  try {
    const { groupId, from: bodyFrom, to, amount, method, notes } = req.body;
    const currentUserId = req.user.id;
    const from = bodyFrom || currentUserId;
    const toUser = to;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (!groupId || !toUser) {
      return res.status(400).json({
        success: false,
        message: 'groupId and to are required'
      });
    }

    if (from !== currentUserId && toUser !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You must be either the payer or receiver for this settlement'
      });
    }

    const settlement = await Settlement.create({
      groupId,
      from,
      to: toUser,
      amount,
      method: method || 'upi',
      notes
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('from to', 'name phone');

    res.status(201).json({
      success: true,
      message: 'Settlement recorded successfully',
      data: populatedSettlement
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Calculate all balances in group
async function calculateAllBalances(groupId) {
  const expenses = await Expense.find({ groupId })
    .populate('paidBy', 'name')
    .populate('splitDetails.userId', 'name');
  
  // Track net balance for each user
  const balances = {};
  const userNames = {};
  const userIds = new Set();

  expenses.forEach(expense => {
    const payerId = expense.paidBy._id.toString();
    userNames[payerId] = expense.paidBy.name || userNames[payerId];
    userIds.add(payerId);

    expense.splitDetails.forEach(split => {
      const splitUserId = split.userId?._id?.toString() || split.userId.toString();
      const splitUserName = split.userId?.name;
      if (splitUserName) {
        userNames[splitUserId] = splitUserName;
      }
      userIds.add(splitUserId);

      if (splitUserId !== payerId) {
        if (!balances[splitUserId]) balances[splitUserId] = {};
        if (!balances[splitUserId][payerId]) balances[splitUserId][payerId] = 0;
        balances[splitUserId][payerId] += split.amount;
      }
    });
  });

  // Populate missing names if any
  const missingIds = Array.from(userIds).filter(id => !userNames[id]);
  if (missingIds.length) {
    const users = await User.find({ _id: { $in: missingIds } });
    users.forEach(user => {
      userNames[user._id.toString()] = user.name;
    });
  }

  const debts = [];
  Object.keys(balances).forEach(from => {
    Object.keys(balances[from]).forEach(to => {
      const amount = balances[from][to];
      if (amount > 0) {
        debts.push({
          from,
          to,
          fromName: userNames[from] || 'Unknown',
          toName: userNames[to] || 'Unknown',
          amount: Math.round(amount * 100) / 100
        });
      }
    });
  });
  
  return debts;
}

// Simplify debts
exports.simplifyDebts = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    const currentDebts = await calculateAllBalances(groupId);
    const simplified = simplifyDebtsAlgorithm(currentDebts);
    
    res.json({
      success: true,
      data: {
        current: currentDebts,
        simplified,
        savings: currentDebts.length - simplified.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Debt simplification algorithm
function simplifyDebtsAlgorithm(debts) {
  // Calculate net balance for each person
  const balances = {};
  
  debts.forEach(({ from, to, amount }) => {
    balances[from] = (balances[from] || 0) - amount;
    balances[to] = (balances[to] || 0) + amount;
  });
  
  // Separate creditors and debtors
  const creditors = [];
  const debtors = [];
  
  Object.entries(balances).forEach(([person, balance]) => {
    if (balance > 0.01) creditors.push({ person, amount: balance });
    if (balance < -0.01) debtors.push({ person, amount: -balance });
  });
  
  // Match debtors with creditors
  const simplified = [];
  let i = 0, j = 0;
  
  while (i < debtors.length && j < creditors.length) {
    const debt = debtors[i];
    const credit = creditors[j];
    
    const settleAmount = Math.min(debt.amount, credit.amount);
    
    simplified.push({
      from: debt.person,
      to: credit.person,
      amount: Math.round(settleAmount * 100) / 100
    });
    
    debt.amount -= settleAmount;
    credit.amount -= settleAmount;
    
    if (debt.amount < 0.01) i++;
    if (credit.amount < 0.01) j++;
  }
  
  return simplified;
}
const Expense = require('../models/expense.model');
const Group = require('../models/group.model');

// Create new expense
exports.createExpense = async (req, res, next) => {
  try {
    const {
      groupId,
      description,
      amount,
      category,
      paidBy,
      splitType,
      selectedMembers, // Array of user IDs to split between
      splitDetails      // For exact/percent/shares (optional)
    } = req.body;
    console.log(req.body);
    
    const userId = req.user.id;
    
    // Validate group exists and user is member
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
    
    // Calculate split details based on type
    let calculatedSplits;
    
    if (splitType === 'equal') {
      // Equal split among selected members
      const splitAmount = amount / selectedMembers.length;
      calculatedSplits = selectedMembers.map(memberId => ({
        userId: memberId,
        amount: Math.round(splitAmount * 100) / 100
      }));
      
      // Adjust for rounding - add remainder to first person
      const totalSplit = calculatedSplits.reduce((sum, s) => sum + s.amount, 0);
      const remainder = Math.round((amount - totalSplit) * 100) / 100;
      if (remainder !== 0) {
        calculatedSplits[0].amount += remainder;
      }
    } else if (splitType === 'exact') {
      // Use provided exact amounts
      calculatedSplits = splitDetails;
    }
    
    // Create expense
    const expense = await Expense.create({
      groupId,
      description,
      amount,
      category: category || 'Other',
      paidBy: paidBy || userId,
      splitType,
      splitDetails: calculatedSplits,
      createdBy: userId
    });
    
    // Populate and return
    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name')
      .populate('splitDetails.userId', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: populatedExpense
    });
  } catch (error) {
    next(error);
  }
};

// Get all expenses for a group
exports.getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Verify membership
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
    
    // Get expenses
    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'name')
      .populate('splitDetails.userId', 'name')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    next(error);
  }
};

// Delete expense
exports.deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;
    
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Only creator or group admin can delete
    if (expense.createdBy.toString() !== userId) {
      const group = await Group.findById(expense.groupId);
      const isAdmin = group.members.some(
        m => m.userId.toString() === userId && m.role === 'admin'
      );
      
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only expense creator or group admin can delete'
        });
      }
    }
    
    await expense.deleteOne();
    
    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
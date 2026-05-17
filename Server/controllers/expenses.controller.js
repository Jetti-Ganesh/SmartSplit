const Expense = require('../models/expense.model');
const Group = require('../models/group.model');
const mongoose = require('mongoose');

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
    console.log('Request body:', req.body);
    
    const userId = req.user.id;
    console.log('Current user ID:', userId);
    
    // Validate required fields
    if (!groupId || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'groupId, description, and amount are required'
      });
    }
    
    // Validate group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    const isMember = group.members.some(
      m => m.userId.toString() === userId.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not a member of this group'
      });
    }
    
    // Validate splitType and selectedMembers/splitDetails
    if (!splitType) {
      return res.status(400).json({
        success: false,
        message: 'Split type is required'
      });
    }

    // Calculate split details based on type
    let calculatedSplits;
    
    if (splitType === 'equal') {
      // Equal split among selected members
      if (!selectedMembers || selectedMembers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Selected members are required for equal split'
        });
      }

      // Use fixed decimal arithmetic to avoid floating-point errors
      const totalPaisa = Math.round(amount * 100);
      const perPersonPaisa = Math.floor(totalPaisa / selectedMembers.length);
      const remainderPaisa = totalPaisa % selectedMembers.length;

      // Validate member IDs
      for (const memberId of selectedMembers) {
        if (!mongoose.isValidObjectId(memberId)) {
          return res.status(400).json({ success: false, message: `Invalid member ID: ${memberId}` });
        }
      }

      calculatedSplits = selectedMembers.map((memberId, index) => ({
        userId: new mongoose.Types.ObjectId(memberId),
        // Add remainder to the first person to ensure split equals total
        amount: (perPersonPaisa + (index === 0 ? remainderPaisa : 0)) / 100
      }));
    } else if (splitType === 'exact') {
      // Use provided exact amounts
      if (!splitDetails || splitDetails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Split details are required for exact split'
        });
      }
      // validate splitDetails userIds
      for (const split of splitDetails) {
        if (!mongoose.isValidObjectId(split.userId) || typeof split.amount !== 'number') {
          return res.status(400).json({ success: false, message: 'Invalid split detail entries' });
        }
      }
      calculatedSplits = splitDetails.map(split => ({
        userId: new mongoose.Types.ObjectId(split.userId),
        amount: split.amount
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: `Invalid split type: ${splitType}`
      });
    }
    
    console.log('Calculated splits:', JSON.stringify(calculatedSplits, null, 2));
    
    // Validate total amount
    const totalSplit = calculatedSplits.reduce((sum, split) => sum + split.amount, 0);
    console.log(`Total split: ₹${totalSplit.toFixed(2)}, Expected: ₹${amount.toFixed(2)}`);
    
    // Create expense
    const expense = await Expense.create({
      groupId: new mongoose.Types.ObjectId(groupId),
      description,
      amount,
      category: category || 'Other',
      paidBy: paidBy ? new mongoose.Types.ObjectId(paidBy) : new mongoose.Types.ObjectId(userId),
      splitType,
      splitDetails: calculatedSplits,
      createdBy: new mongoose.Types.ObjectId(userId)
    });
    
    console.log('Expense created with ID:', expense._id);
    
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
    console.error('Error creating expense:', error.message);
    console.error('Error stack:', error.stack);
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
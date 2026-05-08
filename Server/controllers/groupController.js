const Group = require('../models/group.model');
exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const groups = await Group.find({
      'members.userId': userId,
      isActive: true
    })
    .populate('members.userId', 'name phone profilePic')
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
    
    // Calculate balance for each group
    const groupsWithBalances = await Promise.all(
      groups.map(async (group) => {
        const balance = await calculateUserBalanceInGroup(group._id, userId);
        return {
          ...group.toObject(),
          userBalance: balance
        };
      })
    );
    
    res.json({
      success: true,
      data: groupsWithBalances
    });
  } catch (error) {
    next(error);
  }
};

// Create new group
exports.createGroup = async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    const userId = req.user.id;
    
    const group = await Group.create({
      name,
      icon: icon || '👥',
      createdBy: userId,
      members: [{
        userId,
        role: 'admin'
      }]
    });
    
    const populatedGroup = await Group.findById(group._id)
      .populate('members.userId', 'name phone profilePic');
    
    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup
    });
  } catch (error) {
    next(error);
  }
};

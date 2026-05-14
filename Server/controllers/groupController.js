const Group = require('../models/group.model');
exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      'members.userId': userId,
      isActive: true
    })
      .populate('members.userId', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    // console.log(groups);

    // Calculate balance for each group
    // const groupsWithBalances = await Promise.all(
    //   groups.map(async (group) => {
    //     const balance = await calculateUserBalanceInGroup(group._id, userId);
    //     return {
    //       ...group.toObject(),
    //       userBalance: balance
    //     };
    // })
    // );

    res.json({
      success: true,
      // data: groupsWithBalances
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// Create new group
exports.createGroup = async (req, res, next) => {
  try {
    const { name, icon, description } = req.body;
    const userId = req.user.id;

    const group = await Group.create({
      name,
      icon: icon || '👥',
      description: description || 'No description provided',
      createdBy: userId,
      members: [{
        userId,
        role: 'admin'
      }]
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members.userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: populatedGroup
    });
  } catch (error) {
    next(error);
  }
};

// Add member to group
exports.addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { email } = req.body;
    const userId = req.user.id;
    
    // Find group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }
    
    // Check if requester is admin
    const requester = group.members.find(
      m => m.userId.toString() === userId && m.role === 'admin'
    );
    if (!requester) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can add members'
      });
    }
    
    // Find user by email
    const User = require('../models/User');
    const newUser = await User.findOne({ email });
    if (!newUser) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }
    
    // Check if already a member
    const alreadyMember = group.members.some(
      m => m.userId.toString() === newUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }
    
    // Add member
    group.members.push({
      userId: newUser._id,
      role: 'member'
    });
    await group.save();
    
    const updatedGroup = await Group.findById(groupId)
      .populate('members.userId', 'name phone profilePic');
    
    res.json({
      success: true,
      message: 'Member added successfully',
      data: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

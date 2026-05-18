const User = require('../models/user.model');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('notifications');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const sorted = [...(user.notifications || [])].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};

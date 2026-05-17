const Expense = require('../models/expense.model');
const Group = require('../models/group.model');
const Settlement = require('../models/settleUp.model');
const mongoose = require('mongoose');

// Seed some dummy expenses for the logged in user
exports.seedExpenses = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(401).json({ success: false, message: 'Not logged in' });

        // Check if user has groups, if not we can't seed properly, but let's try to get one
        let groups = await Group.find({ 'members.userId': userId });
        if (groups.length === 0) {
            // Create a dummy group for testing
            const newGroup = await Group.create({
                name: "Test Analytics Group",
                createdBy: userId,
                members: [{ userId: userId, role: 'admin' }]
            });
            groups = [newGroup];
        }

        const groupId = groups[0]._id;

        const categories = ['Food', 'Travel', 'Rent', 'Entertainment', 'Shopping', 'Utilities', 'Others'];
        const descriptions = ['Groceries', 'Cab to Airport', 'Monthly Rent', 'Movie Tickets', 'New Shoes', 'Electricity Bill', 'Miscellaneous'];

        const expenses = [];
        for (let i = 0; i < 20; i++) {
            const randomCatIndex = Math.floor(Math.random() * categories.length);
            const amt = Math.floor(Math.random() * 5000) + 100;
            // Spread dates over the last 30 days
            const d = new Date();
            d.setDate(d.getDate() - Math.floor(Math.random() * 30));

            expenses.push({
                description: descriptions[randomCatIndex],
                amount: amt,
                category: categories[randomCatIndex],
                paidBy: userId,
                groupId: groupId,
                date: d,
                participants: [{ userId: userId, share: amt }]
            });
        }

        await Expense.insertMany(expenses);
        res.status(200).json({ success: true, message: 'Seeded 20 expenses successfully' });
    } catch (err) {
        console.error("Seed error", err);
        res.status(500).json({ success: false, message: 'Seed failed' });
    }
};

exports.getAnalytics = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const { period } = req.query;

    // ── DATE RANGE ──
    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'custom' && req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // month — start of current month
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
    }

    const dateFilter = { date: { $gte: startDate, $lte: endDate } };

    // ── CORRECT CATEGORY MAPS (matches expense.model.js enum exactly) ──
    const categoryColors = {
      'Food':          '#10B981',
      'Travel':        '#F59E0B',
      'Rent':          '#3B82F6',
      'Entertainment': '#8B5CF6',
      'Shopping':      '#EC4899',
      'Utilities':     '#06B6D4',
      'Health':        '#EF4444',
      'Other':         '#6B7280',
    };
    const categoryEmojis = {
      'Food':          '🍕',
      'Travel':        '🚗',
      'Rent':          '🏠',
      'Entertainment': '🎉',
      'Shopping':      '🛍️',
      'Utilities':     '⚡',
      'Health':        '🏥',
      'Other':         '📦',
    };

    // ── 1. TOTAL SPENT = user's share across all expenses (splitDetails) ──
    const spentAgg = await Expense.aggregate([
      { $match: { ...dateFilter, 'splitDetails.userId': userId } },
      { $unwind: '$splitDetails' },
      { $match: { 'splitDetails.userId': userId } },
      { $group: { _id: null, total: { $sum: '$splitDetails.amount' } } }
    ]);
    const totalSpent = spentAgg[0]?.total || 0;

    // ── 2. OWED TO USER = user paid, sum of OTHER members' shares ──
    const paidByUserExpenses = await Expense.find({
      ...dateFilter,
      paidBy: userId
    }).select('amount splitDetails');

    let totalOwed = 0;
    paidByUserExpenses.forEach(exp => {
      exp.splitDetails.forEach(split => {
        if (split.userId.toString() !== userId.toString()) {
          totalOwed += split.amount;
        }
      });
    });

    // ── 3. USER OWES = someone else paid, user has a share ──
    const userOwesExpenses = await Expense.find({
      ...dateFilter,
      paidBy: { $ne: userId },
      'splitDetails.userId': userId
    }).select('paidBy splitDetails');

    let totalOwe = 0;
    userOwesExpenses.forEach(exp => {
      const userSplit = exp.splitDetails.find(
        s => s.userId.toString() === userId.toString()
      );
      if (userSplit) totalOwe += userSplit.amount;
    });

    // ── 4. CATEGORIES = user's share per category ──
    const categoryAgg = await Expense.aggregate([
      { $match: { ...dateFilter, 'splitDetails.userId': userId } },
      { $unwind: '$splitDetails' },
      { $match: { 'splitDetails.userId': userId } },
      { $group: {
        _id: '$category',
        amount: { $sum: '$splitDetails.amount' }
      }},
      { $sort: { amount: -1 } }
    ]);

    const categories = categoryAgg.map(c => ({
      name: c._id,
      amount: c.amount,
      pct: totalSpent > 0 ? Math.round((c.amount / totalSpent) * 100) : 0,
      color: categoryColors[c._id] || '#6B7280',
      emoji: categoryEmojis[c._id] || '📦',
    }));

    // ── 5. TREND = user's share per day + real group avg ──
    const trendAgg = await Expense.aggregate([
      { $match: { ...dateFilter, 'splitDetails.userId': userId } },
      { $unwind: '$splitDetails' },
      { $match: { 'splitDetails.userId': userId } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        amount: { $sum: '$splitDetails.amount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Real group avg per day: total expense amount / number of members
    const userGroups = await Group.find({ 'members.userId': userId }).select('_id members');
    const groupIds = userGroups.map(g => g._id);
    const avgMemberCount = userGroups.length > 0
      ? userGroups.reduce((sum, g) => sum + g.members.length, 0) / userGroups.length
      : 1;

    const groupTrendAgg = await Expense.aggregate([
      { $match: { ...dateFilter, groupId: { $in: groupIds } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        total: { $sum: '$amount' }
      }}
    ]);
    const avgMap = {};
    groupTrendAgg.forEach(g => {
      avgMap[g._id] = Math.round(g.total / avgMemberCount);
    });

    const labels = trendAgg.map(t => {
      const d = new Date(t._id);
      return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    });
    const mine = trendAgg.map(t => Math.round(t.amount));
    const avg = trendAgg.map(t => avgMap[t._id] || 0);

    // ── 6. EXPENSES LIST = all expenses user participates in ──
    const expensesList = await Expense.find({
      ...dateFilter,
      'splitDetails.userId': userId
    })
    .sort({ date: -1 })
    .limit(50)
    .populate('groupId', 'name icon')
    .populate('paidBy', 'name');

    const formattedExpenses = expensesList.map(e => {
      const userSplit = e.splitDetails.find(
        s => s.userId.toString() === userId.toString()
      );
      const paidByName = e.paidBy?._id?.toString() === userId.toString()
        ? 'You'
        : (e.paidBy?.name || 'Someone');
      return {
        desc: e.description,
        category: e.category,
        emoji: categoryEmojis[e.category] || '📦',
        color: categoryColors[e.category] || '#6B7280',
        paid: paidByName,
        share: userSplit ? Math.round(userSplit.amount) : 0,
        total: e.amount,
        date: `${e.date.getDate()} ${e.date.toLocaleString('default', { month: 'short' })}`,
        groupName: e.groupId?.name || 'Personal',
        groupIcon: e.groupId?.icon || '👥',
      };
    });

    // ── 7. GROUPS = user's share per group ──
    const groupAgg = await Expense.aggregate([
      { $match: { ...dateFilter, 'splitDetails.userId': userId } },
      { $unwind: '$splitDetails' },
      { $match: { 'splitDetails.userId': userId } },
      { $group: {
        _id: '$groupId',
        amount: { $sum: '$splitDetails.amount' },
        count: { $sum: 1 }
      }}
    ]);

    const groupDetails = await Group.find({
      _id: { $in: groupAgg.map(g => g._id) }
    }).select('name icon');

    const groups = groupAgg.map(g => {
      const info = groupDetails.find(gd => gd._id.toString() === g._id?.toString());
      return {
        name: info?.name || 'Unknown Group',
        icon: info?.icon || '👥',
        amount: Math.round(g.amount),
        count: g.count,
      };
    }).sort((a, b) => b.amount - a.amount);

    // ── 8. SMART INSIGHT ──
    const topCat = categories[0];
    let insight = '';
    if (!topCat) {
      insight = 'No spending recorded for this period. Add expenses to see insights.';
    } else if (totalOwe > totalOwed && totalOwe > 0) {
      insight = `💸 You owe ₹${Math.round(totalOwe).toLocaleString('en-IN')} more than you're owed. Consider settling up soon.`;
    } else if (totalOwed > 0 && totalOwed > totalOwe) {
      insight = `💰 You're owed ₹${Math.round(totalOwed).toLocaleString('en-IN')} this period. Remind your group to settle up!`;
    } else if (topCat.pct >= 50) {
      insight = `${topCat.emoji} ${topCat.pct}% of your spending this period was on ${topCat.name}. That's your top category by far.`;
    } else {
      insight = `${topCat.emoji} Your top spend category is ${topCat.name} at ₹${Math.round(topCat.amount).toLocaleString('en-IN')} (${topCat.pct}% of total).`;
    }

    // ── 9. THREE PREMIUM NEW FEATURES (KEEPING THEM WORKABLE) ──
    const biggestExpense = await Expense.findOne({
      date: { $gte: startDate, $lte: endDate },
      'splitDetails.userId': userId
    }).sort({ amount: -1 }).populate('groupId', 'name').populate('paidBy', 'name');

    const topExpense = biggestExpense ? {
      desc: biggestExpense.description,
      amount: biggestExpense.amount,
      category: biggestExpense.category,
      emoji: categoryEmojis[biggestExpense.category] || '📦',
      groupName: biggestExpense.groupId?.name || 'Personal',
      date: `${biggestExpense.date.getDate()} ${biggestExpense.date.toLocaleString('default', { month: 'short' })}`,
    } : null;

    const dayCount = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    const dailyAvg = Math.round(totalSpent / dayCount);

    const pendingSettlements = await Settlement.countDocuments({ 
      $or: [{ from: userId }, { to: userId }], 
      status: 'pending' 
    });

    return res.status(200).json({
      success: true,
      data: {
        insight,
        summary: {
          spent: `₹${Math.round(totalSpent).toLocaleString('en-IN')}`,
          owed:  `₹${Math.round(totalOwed).toLocaleString('en-IN')}`,
          owe:   `₹${Math.round(totalOwe).toLocaleString('en-IN')}`,
        },
        trend: { labels, mine, avg },
        categories,
        groups,
        expenses: formattedExpenses,
        topExpense,
        dailyAvg,
        pendingSettlements
      }
    });

  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

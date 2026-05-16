const Expense = require('../models/expense.model');
const Group = require('../models/group.model');
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
        const { period } = req.query; // '7d', 'month', 'custom'
        
        let startDate = new Date();
        let endDate = new Date();

        if (period === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'custom' && req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
        } else {
            // default to 'month'
            startDate.setDate(1); // Start of current month
        }

        const dateFilter = {
            date: { $gte: startDate, $lte: endDate }
        };

        // 1. Total spent by user in period (where paidBy == userId)
        const totalSpentAgg = await Expense.aggregate([
            { $match: { ...dateFilter, paidBy: userId } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalSpent = totalSpentAgg.length ? totalSpentAgg[0].total : 0;

        // Owed and owe (Mocking for now as we don't have a full settlement system)
        const totalOwed = Math.floor(totalSpent * 0.2);
        const totalOwe = Math.floor(totalSpent * 0.1);

        // 2. Spending by category
        const categoryAgg = await Expense.aggregate([
            { $match: { ...dateFilter, paidBy: userId } },
            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
            { $sort: { amount: -1 } }
        ]);

        const categoryColors = {
            'Food': '#10B981', 'Travel': '#F59E0B', 'Rent': '#3B82F6', 
            'Entertainment': '#8B5CF6', 'Shopping': '#EC4899', 'Utilities': '#06B6D4', 'Others': '#6B7280'
        };
        const categoryEmojis = {
            'Food': '🍕', 'Travel': '🚗', 'Rent': '🏠', 
            'Entertainment': '🎉', 'Shopping': '🛍️', 'Utilities': '⚡', 'Others': '📦'
        };

        const categories = categoryAgg.map(c => ({
            name: c._id,
            amount: c.amount,
            pct: Math.round((c.amount / totalSpent) * 100) || 0,
            color: categoryColors[c._id] || '#6B7280',
            emoji: categoryEmojis[c._id] || '📦'
        }));

        // 3. Trends (by day)
        const trendAgg = await Expense.aggregate([
            { $match: { ...dateFilter, paidBy: userId } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                amount: { $sum: "$amount" }
            }},
            { $sort: { _id: 1 } }
        ]);

        const labels = trendAgg.map(t => {
            const d = new Date(t._id);
            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        });
        const mine = trendAgg.map(t => t.amount);
        const avg = trendAgg.map(t => Math.floor(t.amount * 0.8)); // Mock group average

        // 4. Expenses list
        const expensesList = await Expense.find({ ...dateFilter, paidBy: userId })
            .sort({ date: -1 })
            .limit(20)
            .populate('groupId', 'name');

        const formattedExpenses = expensesList.map(e => ({
            desc: e.description,
            cat: e.category,
            emoji: categoryEmojis[e.category] || '📦',
            color: categoryColors[e.category] || '#6B7280',
            paid: 'You',
            share: e.participants.find(p => p.userId.toString() === userId.toString())?.share || e.amount,
            total: e.amount,
            date: `${e.date.getDate()} ${e.date.toLocaleString('default', { month: 'short' })}`,
            groupName: e.groupId ? e.groupId.name : 'Unknown'
        }));

        // 5. Groups Breakdown
        const groupAgg = await Expense.aggregate([
            { $match: { ...dateFilter, paidBy: userId } },
            { $group: { _id: "$groupId", amount: { $sum: "$amount" }, count: { $sum: 1 } } }
        ]);

        const groupIds = groupAgg.map(g => g._id);
        const groupsData = await Group.find({ _id: { $in: groupIds } });

        const groups = groupAgg.map(g => {
            const groupInfo = groupsData.find(gd => gd._id.toString() === g._id.toString());
            return {
                name: groupInfo ? groupInfo.name : 'Unknown',
                icon: groupInfo ? groupInfo.icon : '👥',
                amount: g.amount,
                count: g.count
            };
        }).sort((a,b) => b.amount - a.amount);

        // Calculate top category for insight
        const topCat = categories.length ? categories[0].name : 'everything';

        res.status(200).json({
            success: true,
            data: {
                insight: `Most of your spending went to ${topCat} this period.`,
                summary: {
                    spent: `₹${totalSpent.toLocaleString('en-IN')}`,
                    owed: `₹${totalOwed.toLocaleString('en-IN')}`,
                    owe: `₹${totalOwe.toLocaleString('en-IN')}`
                },
                trend: {
                    labels,
                    mine,
                    avg
                },
                categories,
                groups,
                expenses: formattedExpenses
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

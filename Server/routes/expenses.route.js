const {createExpense, getGroupExpenses} = require('../controllers/expenses.controller');
const express = require('express');
const { protect } = require("../middlewares/auth");
const router = express.Router();
router.post('/create-expense', [protect], createExpense);
router.get('/getexpenses/:groupId', [protect], getGroupExpenses);
module.exports = router;
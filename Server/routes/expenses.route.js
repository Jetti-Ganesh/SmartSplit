const {createExpense} = require('../controllers/expenses.controller');
const express = require('express');
const { protect } = require("../middlewares/auth");
const router = express.Router();
router.post('/create-expense', [protect], createExpense);
module.exports = router;
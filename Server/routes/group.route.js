const { createGroup, getUserGroups } = require("../controllers/groupController")
const express = require('express');
const { protect } = require("../middlewares/auth");
const router = express.Router();
router.post('/create-group', [protect], createGroup);
router.get('/getgroups', [protect], getUserGroups);
module.exports = router;
const { createGroup, getUserGroups, addMember, joinByCode } = require("../controllers/groupController")
const express = require('express');
const { protect } = require("../middlewares/auth");
const router = express.Router();
router.post('/create-group', [protect], createGroup);
router.get('/getgroups', [protect], getUserGroups);
router.post('/add-member/:groupId', [protect], addMember);
router.post('/join-group', [protect], joinByCode);
module.exports = router;
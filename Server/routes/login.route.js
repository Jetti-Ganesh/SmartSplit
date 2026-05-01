const router = require("express").Router();

router.post("/login",(req,res)=>
{
    console.log((req.body));
    
    res.send("Login Page");
})
module.exports = router;
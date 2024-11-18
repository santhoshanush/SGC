const express = require("express");
const router = express.Router();
const cryptojs = require('crypto-js');

const db = require("../model/db");
const mongoose = require('mongoose');
const Members = require("../model/members");
const Users = require("../model/users");



const dbURI = db("username","yourpass","dbname");



mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true }) 
.then(console.log("database connected"))
.catch(err => console.log(err));

const issessionedUser1 = (req,res,next) => {
    
    if(req.session.user){
        console.log("sessioned user"+req.session.user);
        res.redirect("/admin/copform")
    }
    else{
        console.log(req.session.user + "unsesssioned user");
        next();
    }
} 
const issessionedUser2 = (req,res,next) => {
    
    if(req.session.user){
        console.log("sessioned user"+req.session.user);
        next();
    }
    else{
        console.log(req.session.user + "unsesssioned user");
        res.redirect("/admin")
    }
} 

const isValidUser = async (req,res,next) => { 
    
    const date = new Date();
    const month = date.getMonth() + 1;
    const todaydate = date.getFullYear() + "-" + month + "-" + date.getDate();

    req.session.todaydate = todaydate;

    const comb = "admin" + "pass" + todaydate

    const secretphrase = (cryptojs.SHA256(comb)) +"";

    console.log(secretphrase);
        if(("admin" == req.body.adm) && ( "pass" == req.body.password) && ( secretphrase == req.body.pp)){
            req.session.user  = "admin";
            next();
        }
        else{
            res.render("admin/adminLForm",{err:"please check your username and password"})
        }
}

router.route("/")       
.get(issessionedUser1, async (req,res) => { 
    res.render('admin/adminLForm')
})
.post(isValidUser,(req,res) => { 
    
    req.session.userpath = req.baseUrl+req.path+"";

    res.redirect("/admin/copform")
});



router.get("/copform",issessionedUser2,(req,res) => {
    res.render("admin/adminCOPForm")
})


const isValidSecretPassphrase = (req,res,next) => {



    const passsha256 = (cryptojs.SHA256(comb)) +"";

    const secretpassphrase = (cryptojs.MD5(passsha256)) + "";

    const userinppp = req.body.passp + "";

    const userpassp =  (cryptojs.MD5(userinppp)) + "";

    if(secretpassphrase === userinppp){
        next();
    }
    else{
        res.redirect("/admin/copform")
    }

}



router.post("/copform",isValidSecretPassphrase,async (req,res) =>{
    const unqid = (req.body.uniqid).slice(2,-3);
    if(unqid == "19"){
        const deptnme = (req.body.dept + "").toLowerCase();

        const temp = await Users.findOneAndUpdate({uid:req.body.uniqid+"",dept:deptnme},{ $set: { passw: req.body.newpassw + "" }});
        console.log(temp);
        console.log("submitted")
    res.render("admin/adminCOPForm")
    }
    else{
        const deptnme = (req.body.dept + "").toLowerCase();

        const temp = await Members.findOneAndUpdate({memid:req.body.uniqid+"",dept:deptnme},{ $set: { passw: req.body.newpassw + "" }});
        console.log(temp);
        console.log("submitted member")
    res.render("admin/adminCOPForm")
    }

});



router.get("/logout",(req,res) =>{
    req.session.destroy();
    res.redirect("/");
});




module.exports = router;

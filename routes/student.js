const express = require("express");
const router = express.Router();
const cryptojs = require('crypto-js');
const nodemailer = require('nodemailer');

const db = require("../model/db");
const mongoose = require('mongoose');
const Users = require("../model/users");
const Reports = require("../model/reports");
const Responses = require("../model/responses");
const ReportLike = require("../model/reportlike");


const dbURI = db("usersHackathon","pass","hackathon");


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })  
    .then(console.log("database connected"))
    .catch(err => console.log(err));


const transporter = nodemailer.createTransport({
    port: 465,               
    host: "smtp.gmail.com",
        auth: {
            user: 'priv170216@gmail.com',
            pass: 'gt173211@gmail.com123',
            },
    secure: true,
});


const issessionedUser1 = (req,res,next) => {

    if(req.session.user){
        console.log("sessioned user"+req.session.user);
        res.redirect("/student/dashboard")
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
        res.redirect("/student")
    }
} 

const isValidUser = async (req,res,next) => {
    const rollno = req.body.rollno + ""
    const deptnme = rollno.slice(2,-3);
    const isValid = await Users.findOne({uid:rollno.toLowerCase(),dept:deptnme+""});
    if(isValid){    //2,-3

        if((isValid.uid == req.body.rollno) && ( isValid.passw == req.body.password) && (isValid.dob == req.body.dob)){
            console.log(isValid);
            req.session.user  = isValid.usern;
            req.session.dept  = isValid.dept;
            req.session.uid  = isValid.uid;
            req.session.dob  = isValid.dob;
            
            const combination = isValid.uid + isValid.dob + isValid.dept + ""
            const useruniq = (cryptojs.MD5(combination)) +"";
            
            req.session.useruniq = useruniq;
            next();
        }
        else{
            res.render("student/studentLForm",{err:"please check your rollno. and password"})
        }
    }
    else{
        console.log(isValid);
        res.render("student/studentLForm",{err:"please check your rollno. and password"})
    }
}

router.route("/")
.get(issessionedUser1, async (req,res) => { 
    res.render("student/studentLForm",{sid:req.sessionID})
})
.post(isValidUser,(req,res) => { // uid

        req.session.userpath = req.baseUrl+req.path+"";
        res.redirect("/student/dashboard");
});



router.get("/dashboard",issessionedUser2,async (req,res) => {
    console.log("sessioned user " + req.session.user);
    console.log(req.baseUrl+req.path)
    const boreports = await Reports.find({
        dept:req.session.dept
    });
    const likedreports = await ReportLike.find({
        userid:req.session.useruniq,
        dept:req.session.dept
    })
    console.log(req.query);
    const likedArrray = likedreports.map((ele) => {
        return ele._id
    });
    console.log(likedArrray)

    if((!Object.keys(req.query).length) || ((req.query.gtype=="") && (req.query.gstatus==""))){
        res.render("student/studentDashboard",{
            array:boreports,
            la:likedArrray
        })
    }
    else{
            if((req.query.gtype!="") && (req.query.gstatus!="")){

                const sortedreports = await boreports.filter((ele) =>{
                return (ele.gtype==req.query.gtype)&&(ele.gstatus==req.query.gstatus);
            });
            console.log(sortedreports);
            res.render("student/studentDashboard",{
                array:sortedreports,
                la:likedArrray})
        }        
            else if((req.query.gtype!="") && (req.query.gstatus=="")){

                const sortedreports = await boreports.filter((ele) =>{
                return (ele.gtype==req.query.gtype);
                    
            });
            console.log(sortedreports);
            res.render("student/studentDashboard",{
                array:sortedreports,
                la:likedArrray})
        }
            else{
                const sortedreports = await boreports.filter((ele) =>{
                return (ele.gstatus==req.query.gstatus);
                });
                console.log(sortedreports);
            res.render("student/studentDashboard",{
                array:sortedreports,
                la:likedArrray})
            }
    }
});


router.get("/dashboard/:id",issessionedUser2,async (req,res) => {
        const repid = req.params.id;
        const selectedreport = await Reports.findOne({_id:repid,dept:req.session.dept});
        console.log(selectedreport);
        res.render("student/studentSingleReport",{
            array:selectedreport
        })

});

//######################################################################################

router.post("/dashboard/report/:repid",issessionedUser2,async (req,res) => {
    
});


//######################################################################################

router.route("/report")
.get(issessionedUser2, async (req,res) =>{
    const date = new Date();
    const month = date.getMonth() + 1;
    const todaydate = date.getFullYear() + "-" + month + "-" + date.getDate();
    
    req.session.date = todaydate;
    
    const combination = req.session.user + req.session.dept + req.session.uid + date + ""
    const formid = (cryptojs.MD5(combination)) +"";
    
    req.session.fuid = formid;
    
    res.render("student/studentGForm",{
        username:req.session.user,
        dept:req.session.dept,
        rollno:req.session.uid,
        fuid:formid
    }) 
    
})
.post(async (req,res) => {
    console.log("this is uid" + "   " + req.session.fuid)
    const temp = new Reports({
        _id:req.session.fuid,
        gtype:req.body.gtype,
        doi:req.session.date,
        dept:req.session.dept,
        subj:req.body.subj,
        detrep:req.body.detrep,
    });
    const result = await temp.save();
    console.log(result);
    res.redirect("/student/dashboard"); 
})


//######################################################################################



router.get("/response",issessionedUser2,async (req,res) => {
    
    console.log("sessioned student " + req.session.user);
    console.log(req.baseUrl+req.path)
    const boresponses = await Responses.find({dept:req.session.dept});
    console.log(req.query);
    res.render("student/studentRDashboard",{
        array:boresponses
    })

});


router.get("/response/:id",issessionedUser2,async (req,res) => {
        const resid = req.params.id;
        const selectedresponse = await Responses.findOne({_id:resid,dept:req.session.dept});
        console.log(selectedresponse);
        res.render("student/studentSingleResponse",{
            array:selectedresponse
        })

});

router.get('/copass',(req,res) => { 

    res.render("student/studentCOPassForm")

});


router.post('/copass',(req,res) => { 
    
    const subj = req.body.subj + "";
    const msg = req.body.msg + "";

    const mailData = {
        from: 'priv170216@gmail.com',
        to: "priv170216@gmail.com",
        subject: subj,
        text: msg

    };

    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Mail Sent !!!!");        
        res.redirect("/student")
    });


});

router.get("/logout",(req,res) =>{
    req.session.destroy();
    res.redirect("/");
});




module.exports = router;


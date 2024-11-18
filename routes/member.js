const express = require("express");
const router = express.Router();
const cryptojs = require('crypto-js');

const db = require("../model/db");
const Members = require("../model/members");
const Reports = require("../model/reports");
const Responses = require("../model/responses");
const ReportLike = require("../model/reportlike");



const issessionedmember1 = (req,res,next) => {

    if(req.session.memid){
        console.log("sessioned member"+req.session.memid);
        res.redirect("/member/dashboard")
    }
    else{
        console.log(req.session.memid + "unsesssioned member");
        next();
    }
} 
const issessionedmember2 = (req,res,next) => {

    if(req.session.memid){
        console.log("sessioned member"+req.session.memid);
        next();
    }
    else{
        console.log(req.session.memid + "unsesssioned member");
        res.redirect("/member")
    }
} 

const isValidmember = async (req,res,next) => {
    const memidv = req.body.memid + ""
    const deptnme = memidv.slice(3,-4);
    const isValid = await Members.findOne({memid:memidv,dept:deptnme});

    if((isValid.memid == req.body.memid) && ( isValid.passw == req.body.password) && (isValid.dob == req.body.dob)){
            console.log(isValid);
            req.session.memid  = isValid.memid;
            req.session.dept  = isValid.dept;
            req.session.dob  = isValid.dob;
            next();
        }
        else{
            res.render("member/memberLForm",{err:"please enter correct memid and pass"})
        }
}


router.route("/")
.get(issessionedmember1, async (req,res) => { 

    res.render("member/memberLForm",{sid:req.sessionID})
})
.post(isValidmember,(req,res) => { 

        req.session.memberpath = req.baseUrl+req.path+"";
        res.redirect("/member/dashboard");
});



router.get("/dashboard",issessionedmember2,async (req,res) => {
    
    console.log("sessioned member " + req.session.memid);
    console.log(req.baseUrl+req.path)

    if((!Object.keys(req.query).length) || ((req.query.gtype=="") && (req.query.gstatus==""))){

    }
    else{
    }
            
});


router.get("/dashboard/report/:id",issessionedmember2,async (req,res) => {
        const repid = req.params.id;
        const selectedreport = await Reports.findOne({_id:repid,dept:req.session.dept});
        console.log(selectedreport);
        res.render("member/memberSingleReport",{
            array:selectedreport
        })

});


router.route("/reports")
.get(issessionedmember2, async (req,res) =>{

    
})
.post(async (req,res) => {
    
    
});

router.route("/status")
.get(issessionedmember2, async (req,res) =>{
    res.render("member/memberGStatusForm")
})
.post(async (req,res) => {

    const temp = await Reports.updateOne({ _id: req.body.formid + "",dept:req.session.dept}, { $set: { gstatus: req.body.gstatus + "" }});
    console.log(temp)
    res.redirect("/member/dashboard")
});

// ########################################################################################################

router.route("/response")
.get(issessionedmember2, async (req,res) =>{
    const date = new Date();
    const month = date.getMonth() + 1;
    const todaydate = date.getFullYear() + "-" + month + "-" + date.getDate();

    req.session.date = todaydate;
    
    const combination = req.session.memid + req.session.dept + date + ""
    const resid = (cryptojs.MD5(combination)) +"";
    
    req.session.resid = resid;
    
    res.render("member/memberResponseForm",{
        memid:req.session.memid,
        dept:req.session.dept,
        resid:resid
    }) 
    
})
.post(async (req,res) => {
    console.log("this is uid" + "   " + req.session.fuid)
    const temp = new Responses({
        _id: req.session.resid,
        fuid:req.body.fuid,
        dor:req.session.date,
        dept:req.session.dept,
        subj:req.body.subj,
        detres:req.body.detrep
    });
    const result = await temp.save();
    console.log(result);
    res.redirect("/member/dashboard"); 
})



router.get('/copass',(req,res) => { 
    res.render("member/memberCOPassForm")

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
        res.redirect("/member")
    });


});


router.get("/logout",(req,res) =>{
    req.session.destroy();
    res.redirect("/");
});



module.exports = router;

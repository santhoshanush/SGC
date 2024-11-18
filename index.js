const express = require("express");
const app =  express();
const bodyParser = require('body-parser');
const path = require("path");
const session = require('express-session');
const member = require("./routes/member.js");
const student = require("./routes/student.js");
const admin = require("./routes/admin.js");
const { json } = require("express");
const nodemailer = require('nodemailer');


app.set('etag', false);
app.set("view engine", "pug");
app.disable('view cache');

app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: "bfc5221616fd29387d7413aeb41401391dceefa8",
    resave: false,
    saveUninitialized: false
}));
app.use("/static", express.static(path.join(__dirname, "public")));
app.use("/member",member);
app.use("/student",student);
app.use("/admin",admin);



const isSessionedUser = (req,res,next) => {
    
    if(req.session.user){
        console.log("sessioned user"+req.session.user);
        const pathForUser = req.session.userpath;
        console.log(pathForUser)
        res.redirect(pathForUser)
    }
    else{
        console.log(req.session.user + "unsesssioned user");
        next();
    }
} 
const isSessionedUser2 = (req,res,next) => {
    
    if(req.session.memid){
        console.log("sessioned user"+req.session.memid);
        const pathForUser = req.session.memberpath;
        console.log(pathForUser)
        res.redirect(pathForUser)
    }
    else{
        console.log(req.session.user + "unsesssioned user");
        next();
    }
} 
const transporter = nodemailer.createTransport({
    port: 465,             
    host: "smtp.gmail.com",
        auth: {
            user: 'gmailadd',
            pass: 'gmailpass',
            },
    secure: true,
});

app.get('/',isSessionedUser2, isSessionedUser ,(req,res) => {

    res.render("home",{sid:req.sessionID,s:json(req.session)});
});

app.get('/feedback',(req,res) => { 

    res.render("feedback")
    
});


app.post('/feedback',(req,res) => { 
    
    const subj = req.body.subj + "";
    const msg = req.body.msg + "";
    
    const mailData = {
        from: 'priv170216@gmail.com',
        to: "priv170216@gmail.com",
        subject: "Feedback  :" + subj,
        text: msg
    };
    
    transporter.sendMail(mailData, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Mail Sent !!!!");        
        res.redirect("/")
    });


});



app.listen(8080);
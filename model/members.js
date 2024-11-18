const mongoose = require('mongoose');
const { Schema } = mongoose;

const memberSchema = new Schema({

    memid:{
        type:String,
        required:true,
    },
    passw:{
            type:String,
            required:true,
        },
    dob:{
            type:String,
            required:true,
        },
    dept:{
            type:String,
            required:true,
        },
}); // schema structure

const Members = mongoose.model("members",memberSchema);

module.exports = Members;

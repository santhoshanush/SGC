const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    // _id: {
    //     type:String,
    // },
    usern:{
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
    uid:{
            type:String,
            required:true,
        },
    supdocs:{
            type:Array,
            "default" : []
        }

}); // schema structure

const Users = mongoose.model("users",userSchema);

module.exports = Users;

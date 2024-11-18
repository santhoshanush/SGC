const mongoose = require('mongoose');
const { Schema } = mongoose;

const responseSchema = new Schema({
    _id: {
        type:String,
        required:true,
    },
    fuid:{
            type:String,
            required:true,
        },
    dor:{
            type:String,
            required:true,
        },
    dept:{
        type:String,
        required:true,
    },
    subj:{
        type:String,
        required:true,
    },
    detres:{
        type:String,
        required:true,
    }
});

const Responses = mongoose.model("responses",responseSchema);

module.exports = Responses;

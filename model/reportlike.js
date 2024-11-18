const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportLikeSchema = new Schema({

});

const ReportLike = mongoose.model("reportlikes",reportLikeSchema);

module.exports = ReportLike;

//This is the comment model

const mongoose = require('mongoose');

let commentModel = mongoose.Schema({

  comment:{
    type : String,
    required : true,
    default : ""
  },

  commenter:{
    type : mongoose.Schema.Types.ObjectId,
    ref: "User",
    required :true
  },

  commentedAt : {
    type : Date,
    required : true,
    default : Date.now
  }

})

module.exports = mongoose.model("Comment", commentModel)

//This is the user model

const mongoose = require('mongoose');

let userModel = mongoose.Schema({

  username:{
    type:String,
    required:true,
    unique:true
  },

  password:{
    type:String,
    required:true
  },

  email:{
    type:String,
    required:true,
    unique:true
  },

  defaultLocation:{
    type:String,
    required:true
  },

  createdAt:{
    type:Date,
    required:true,
    default:Date.now
  }

})

module.exports = mongoose.model("User", userModel)

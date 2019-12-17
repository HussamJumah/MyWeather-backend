//This is the city model

const mongoose = require('mongoose');

let cityModel = mongoose.Schema({

  zipcode:{
    type : String,
    required : true,
  },

  comments:[{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Comment"
  }]

})

module.exports = mongoose.model("City", cityModel)

const express = require('express');
const http = require('http');
const https = require('https')
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./User');
const City = require('./City');
const Comment = require('./Comment');
const fetch = require('node-fetch');
const async = require('async');

//needed variables
const mongodbLink = "mongodb+srv://test:test@myweather-i4dcw.mongodb.net/test?retryWrites=true&w=majority";
const apiKey = "mfC1Gw-UoAQdiz9W20AWwAH1rpgNT7reD2z3yZxe2Gw"

//needed to connect to mongodb
let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

let app = express()
app.server = http.createServer(app)

app.use(bodyparser.urlencoded({extended: true}))

app.use(bodyparser.json({limit: '100kb'}))

// To make route ./user/
let userRoute = express.Router()

userRoute.post('/login', (req, res) => {
let loginData = req.body;

  let loginQuery = {
    username:loginData.username,
    password:loginData.password
  }
  User.findOne(loginQuery, (err, user)=>{
    if(err){
      throw err
      res.status = 500
      res.writeHead(500, {'Content-Type':"application/json"})
      res.end("There is an error on our side :(")
    }else{
      if (!user){
        res.status = 401
        res.writeHead(401, {'Content-Type':"application/json"})
        res.end("Incorrect username or password")
      }else{
        res.status = 200
        res.writeHead(200, {'Content-Type':"application/json"})
        res.end(JSON.stringify(user))
      }
    }
  })
})

///////////////////////register route/////////////////////////////////
userRoute.post('/register', (req, res) => {
  let registerData = req.body;

  let userNameQuery = {
    username:registerData.username
  }

  let emailQuery = {
    email:registerData.email
  }

  User.findOne({$or: [userNameQuery, emailQuery]}, (err, user) => {
    if (err) {
      throw err
      res.status = 500
      res.writeHead(500, {'Content-Type':"application/json"})
      res.end("There is an error on our side :(")

    } else {

      if(user){
        res.status = 409
        res.writeHead(409, {'Content-Type':"application/json"})
        res.end("This username or email already exist")

      } else {

        let user = User({
          username:registerData.username,
          password:registerData.password,
          email:registerData.email,
          defaultZipcode:registerData.defaultZipcode
        })

        user.save((err)=>{
          if (err){
            throw err
            res.status = 500
            res.writeHead(500, {'Content-Type':"application/json"})
            res.end("There is an error on our side :(")
          }else{
            res.status = 200
            res.writeHead(200, {'Content-Type':"application/json"})
            res.end(JSON.stringify(user))
          }
        })
      }
    }
  })
})

app.use('/user', userRoute)


//to make route ./weather/
let weatherRoute = express.Router()

weatherRoute.get('/:zipcode', (req, res) => {
  let zipcode = req.params.zipcode;

  async.parallel({
    weather: (callback) => {
      requestWeather(zipcode, (err, weather) => {
        if (err) {
          callback(err, null)
        } else {
          callback(null, weather)
        }
      })
    },

    comments: (callback) => {
      let zipcodeQuery = {
        zipcode:zipcode
      }
      let populate = {
        path: 'comments',
        model:'Comment',
        populate:{
          path:"commenter",
          model:"User"
        }
      }
      City.findOne(zipcodeQuery).populate(populate).exec((err,city)=>{
        if (err){
          callback(err, null)
        }else{
          if(!city){
            let city = City({
              zipcode:zipcode
            })
            city.save((err)=>{
              if(err){
                callback(err, null)
              }else{
                callback(null, city.comments)
              }
            })
          }else{
            callback(null, city.comments)
          }
        }
      })
    }
  }, (err, results) => {
    if (err) {
      throw err
      res.status = 500
      res.writeHead(500, {'Content-Type':"application/json"})
      res.end("There is an error on our side :(")
    } else {
      res.status = 200
      res.writeHead(200, {'Content-Type':"application/json"})
      res.end(JSON.stringify(results))
    }
  })



})

weatherRoute.post('/:zipcode/comment', (req, res) => {
  let commentData = req.body
  let zipcode = req.params.zipcode

  let commentquery = {
    zipcode:zipcode
  }

  City.findOne(commentquery,(err, city)=>{
    if(err){
      throw err
      res.status = 500
      res.writeHead(500, {'Content-Type':"application/json"})
      res.end("There is an error on our side :(")
    }else{
      if(!city){
        res.status = 404
        res.writeHead(404, {'Content-Type':"application/json"})
        res.end("This city is not found.")
      }else{
        let newcomment = Comment({
          comment:commentData.comment,
          commenter:commentData.commenter
        })
        newcomment.save((err)=>{
          if (err){
            throw err
            res.status = 500
            res.writeHead(500, {'Content-Type':"application/json"})
            res.end("There is an error on our side :(")
          }else{
            city.comments.push(newcomment._id)

            city.save((err)=>{
              if(err){
                throw err
                res.status = 500
                res.writeHead(500, {'Content-Type':"application/json"})
                res.end("There is an error on our side :(")
              }else{
                res.status = 200
                res.writeHead(200, {'Content-Type':"application/json"})
                res.end(JSON.stringify(newcomment))
              }
            })
          }
        })
      }
    }
  })
})

app.use('/weather', weatherRoute)

//connecting to database
mongoose.connect(mongodbLink, options)
.then(()=>{
  console.log("Successfully connected to Mongodb");
  app.server.listen(3001)
})

function requestWeather(zipcode, callback){
  let url = `https://weather.ls.hereapi.com/weather/1.0/report.json?product=observation&zipcode=${zipcode}&oneobservation=true&apiKey=mfC1Gw-UoAQdiz9W20AWwAH1rpgNT7reD2z3yZxe2Gw`;
  let settings = { method: "Get" };

  fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
      callback(null, {
        city: json.observations.location[0].city,
        temperature:cToF(json.observations.location[0].observation[0].temperature),
        description:json.observations.location[0].observation[0].description
      })
    })
    .catch(err => {
      callback(err, null)
    })
}

function cToF(value) {
  return (value * 9/5) + 32
}

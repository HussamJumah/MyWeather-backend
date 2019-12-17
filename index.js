const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./User');

//needed variables
const mongodbLink = "mongodb+srv://test:test@myweather-i4dcw.mongodb.net/test?retryWrites=true&w=majority";

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

  // Send back JSON
  res.status = 200
  res.writeHead(200, {'Content-Type':"application/json"})
  res.end(JSON.stringify(loginData))

})

//register route
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
          defaultLocation:registerData.defaultLocation
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

weatherRoute.get('/:cityname', (req, res) => {
  let cityname = req.params.cityname;

  // Send back JSON
  res.status = 200
  res.writeHead(200, {'Content-Type':"application/json"})
  res.end(cityname)

})

weatherRoute.post('/:cityname/comment', (req, res) => {

  let obj = {
    commentData: req.body,
    cityname: req.params.cityname
  }
  // Send back JSON
  res.status = 200
  res.writeHead(200, {'Content-Type':"application/json"})
  res.end(JSON.stringify(obj))

})

app.use('/weather', weatherRoute)

//connecting to database
mongoose.connect(mongodbLink, options)
.then(()=>{
  console.log("Successfully connected to Mongodb");
  app.server.listen(3001)
})

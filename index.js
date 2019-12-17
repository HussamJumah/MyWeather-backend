const express = require('express');
const http = require('http');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

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

userRoute.post('/register', (req, res) => {
let registerData = req.body;

  // Send back JSON
  res.status = 200
  res.writeHead(200, {'Content-Type':"application/json"})
  res.end(JSON.stringify(registerData))

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

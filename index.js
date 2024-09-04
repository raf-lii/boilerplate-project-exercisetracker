const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const usersModel = require('./models/usersModel');
const exercisesModel = require('./models/exercisesModel');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const createUser = usersModel.connected({username: req.body.username});

  createUser.save()
    .then(result => {
      res.json({'username': req.body.username, '_id':result._id})
    })
});

app.get('/api/users', async (req, res) => {
  const users = usersModel.connected;

  const search = await users.find({});

  return res.json(search);
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const user = usersModel.connected;

  const searchUser = await user.findById(req.params._id);
  
  if(!searchUser) return res.json({error: "User doesnt exist"});

  const exercise = exercisesModel.connected({
    username: searchUser.username, 
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: (req.body.date)? new Date(req.body.date) : new Date(),
  });

  //tes

  exercise.save()
    .then(result => {
      return res.json({
        _id: req.params._id,
        username: searchUser.username,
        date: exercise.date.toDateString(),
        duration: parseInt(req.body.duration),
        description: req.body.description,
      });
    })
});

app.get('/api/users/:_id/logs', async (req, res) => {

  const userModel = usersModel.connected;

  const user = await userModel.findById(req.params._id);

  if(!user) return res.json({error: "User not found"});

  const exerciseModel = exercisesModel.connected;

  let exercise = [];
  
  let result = {
    _id: user._id,
    username: user.username,
  };

  if(req.query.from || req.query.to){
    let from = new Date (req.query.from+ "T00:00:00.000-06:00").toDateString();
    let to = new Date (req.query.to+ "T00:00:00.000-06:00").toDateString();
    let limit = parseInt(req.query.limit);

    exercise = await exerciseModel.find({username: user.username, date: {$gte: from, $lte: to}}).limit(limit);

    result.count = exercise.length;
    result.from = from;
    result.to = to;

  }else if(req.query.limit){
    let limit = parseInt(req.query.limit);
    exercise = await exerciseModel.find({username: user.username}).limit(limit);
    
    result.count = exercise.length;
  }else{
    exercise = await exerciseModel.find({username: user.username}, {_id:0, __v:0, username:0})
    // result.count = await exerciseModel.countDocuments({username: user.username});
    result.count = exercise.length;
  }

  console.log(exercise);

  let logsResult = [];

  for(let entry of exercise){
    logsResult.push({
      description: entry.description,
      duration: parseInt(entry.duration),
      date: new Date(entry.date).toDateString()
    });
  }

  result.log = logsResult;

  return res.json(result)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT || 5000;
var tasksRoute = require('./routes/tasks.js');

app.use(bodyParser.urlencoded({extended: true}));

app.use('/tasks', tasksRoute);

app.get('/*', function(req, res) {
  var file = req.params[0] || '/view/index.html';
  res.sendFile(path.join(__dirname, '/public/', file));
});

app.listen(port, function(){
  console.log('listening on port', port);
});

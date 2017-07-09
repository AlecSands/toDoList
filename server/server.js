var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
// Checks for a port defined by the cloud, if none exists it sets it to 5000.
var port = process.env.PORT || 5000;
// Requres the tasks route on the server
// I'm totally sure I understand what the advantages of using a router are.
var tasksRoute = require('./routes/tasks.js');

// Pass all server requests through body parser
app.use(bodyParser.urlencoded({extended: true}));

// Sends all tasks paths to the appropriate route.
app.use('/tasks', tasksRoute);

// Sends the index.html and uses path to retrieve all other files sourced in
// the index.html.
app.get('/*', function(req, res) {
  var file = req.params[0] || '/view/index.html';
  res.sendFile(path.join(__dirname, '/public/', file));
});

// Sets the server to listen for requests
app.listen(port, function(){
  console.log('listening on port', port);
});

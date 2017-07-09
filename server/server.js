var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var port = process.env.PORT || 5000;
var tasksRoute = require('./routes/tasks.js');

var graphData = {
  "nodes": [
    {"id": "Alec", "group": 1},
    {"id": "Pam", "group": 1},
    {"id": "Mary", "group": 2},
    {"id": "Scott", "group": 2},
    {"id": "Andrea", "group": 4},
    {"id": "Zach", "group": 3},
    {"id": "Walter", "group": 3},
    {"id": "Howard", "group": 3}
  ],
  "links": [
    {"source": "Alec", "target": "Pam", "value": 1},
    {"source": "Alec", "target": "Mary", "value": 1},
    {"source": "Alec", "target": "Scott", "value": 1},
    {"source": "Alec", "target": "Walter", "value": 1},
    {"source": "Alec", "target": "Howard", "value": 1},
    {"source": "Alec", "target": "Zach", "value": 1},
    {"source": "Mary", "target": "Scott", "value": 1},
    {"source": "Howard", "target": "Zach", "value": 1},
    {"source": "Walter", "target": "Zach", "value": 1},
    {"source": "Walter", "target": "Howard", "value": 1},
    {"source": "Pam", "target": "Andrea", "value": 1}
  ]
};

app.get('/d3data', function(req, res) {
  res.send(graphData);
});

app.use(bodyParser.urlencoded({extended: true}));

app.use('/tasks', tasksRoute);

app.get('/*', function(req, res) {
  var file = req.params[0] || '/view/index.html';
  res.sendFile(path.join(__dirname, '/public/', file));
});

app.listen(port, function(){
  console.log('listening on port', port);
});

// Sets up all the basic required libraries for the tasks route
var express = require('express');
var router = express.Router();
var pg = require('pg');

// Create a javascript object which will be used to connect to the server
var config = {
  database: 'antares',
  host: 'localhost',
  // This is different because of some screwy stuff that happened with my installation.
  port: 5433,
  // Define the max number of connections in the pool
  max: 10,
  idleTimeoutMillis: 3000
};

// Sets up the pg pool for connecting the database
var pool = new pg.Pool(config);

// This route responds to the d3 data request from the client
router.get('/d3data', function(req, res){
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "to_do_list" ORDER BY "description" DESC;';
      db.query(queryText, function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // Store the data from the database in a variable
          serverData = result.rows;
          // This is converting the sql data into an object which can be understood
          // by the d3 code on the client
          var d3data = {};
          // These basic nodes will never change
          d3data.nodes = [
            {"id": "My Locations", "group": 1},
            {"id": "Home office", "group": 2},
            {"id": "Kitchen", "group": 2},
            {"id": "Bedroom", "group": 2},
            {"id": "Coffee shop", "group": 2},
            {"id": "School", "group": 2},
            {"id": "Errand", "group": 2}
          ];
          // These links will never change
          d3data.links = [
            {"source": "My Locations", "target": "Home office", "value": 1},
            {"source": "My Locations", "target": "Kitchen", "value": 1},
            {"source": "My Locations", "target": "Bedroom", "value": 1},
            {"source": "My Locations", "target": "Coffee shop", "value": 1},
            {"source": "My Locations", "target": "School", "value": 1},
            {"source": "My Locations", "target": "Errand", "value": 1}
          ];
          // This loops through the data from the database and push new objects
          // into the arrays above as necessary
          for (i=0; i<serverData.length; i++) {
            var newTaskData = serverData[i];
            newTaskData.location = capitalizeFirstLetter(newTaskData.location);
            var groupNum;
            if (newTaskData.task_complete == 'n') {
              groupNum = 'notComplete';
            } else if (newTaskData.task_complete == 'y') {
              groupNum = 'complete';
            }
            var newNode = {"id": newTaskData.description, "group": groupNum};
            var newLink = {"source": newTaskData.location,
                           "target": newTaskData.description,
                           "value": 1
                          };
            d3data.nodes.push(newNode);
            d3data.links.push(newLink);
          }
          // Send back the converted object
          res.send(d3data);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of GET

// Respond to basic get request from the client.
// This could likely be combined into the above request in a future version.
router.get('/', function(req, res){
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "to_do_list" ORDER BY "description" DESC;';
      db.query(queryText, function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // Send back the results
          res.send({tasks: result.rows});
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of GET

// Responds to basic POST request from the client
router.post('/', function(req, res) {
  // Use body parser to retrieve the data passed from the client
  var newTask = req.body;
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      // Create a string which is a SQL query that will be passed to postresql.
      // I'm still not 100% on which of these terms refers to what (postresql, sql, and postico)
      var queryText = 'INSERT INTO "to_do_list" ("description", "location", "task_complete")' +
                      ' VALUES ($1, $2, $3);';
      // Sends the query to the database
      db.query(queryText, [newTask.description, newTask.location, newTask.status], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log(errorMakingQuery);
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // Send status code of success
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of POST

//Responds to a PUT request from the client
router.put('/', function(req, res){
  var updateTask = req.body; // Koala with updated content
  console.log('Put route called with task of ', updateTask);
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      console.log(updateTask);
      // Same as above
      var queryText = 'UPDATE "to_do_list" SET "task_complete" = $1 WHERE user_id = $2;';
      db.query(queryText, [updateTask.task_complete, updateTask.user_id], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // Send back status of success
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of PUT

// Respond to a delete request from the client which looks for the id in the path
router.delete('/:id', function(req, res){
  // Retrieves the id value in the path and stores it in a variable
  var id = req.params.id;
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      var queryText = 'DELETE FROM "to_do_list"' +
                      'WHERE "user_id" = $1;';
      db.query(queryText, [id], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // Send back status of success
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of PUT

module.exports = router;

// Convert string to capitalize first letter of the string.
// This insures that the data in the d3 object is read correctly.
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

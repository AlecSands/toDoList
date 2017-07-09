var express = require('express');
var router = express.Router();
var pg = require('pg');

var config = {
  database: 'antares',
  host: 'localhost',
  port: 5433,
  max: 10,
  idleTimeoutMillis: 3000
};

var pool = new pg.Pool(config);

router.get('/', function(req, res){
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      var queryText = 'SELECT * FROM "to_do_list" ORDER BY "description" DESC;';
      // errorMakingQuery is a bool, result is an object
      db.query(queryText, function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // console.log(result);
          // Send back the results
          res.send({tasks: result.rows});
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of GET

router.post('/', function(req, res) {
  var newTask = req.body;
  console.log(newTask);
  // PASTED PG CODE
  // errorConnecting is bool, db is what we query against,
  // done is a function that we call when we're done
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      // We connected to the database!!!
      // Now we're going to GET things from the db
      var queryText = 'INSERT INTO "to_do_list" ("description", "location", "task_complete")' +
                      ' VALUES ($1, $2, $3);';
      // errorMakingQuery is a bool, result is an object
      db.query(queryText, [newTask.description, newTask.location, newTask.status], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log(errorMakingQuery);
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // console.log(result);
          // Send back the results
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of POST

router.put('/', function(req, res){
  var updateTask = req.body; // Koala with updated content
  console.log('Put route called with task of ', updateTask);

  // YOUR CODE HERE
  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      console.log(updateTask);
      // We connected to the database!!!
      // Now we're going to GET things from the db
      var queryText = 'UPDATE "to_do_list" SET "task_complete" = $1 WHERE user_id = $2;';
      // errorMakingQuery is a bool, result is an object
      db.query(queryText, [updateTask.task_complete, updateTask.user_id], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // console.log(result);
          // Send back the results
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of PUT

router.delete('/:id', function(req, res){
  var id = req.params.id;

  pool.connect(function(errorConnectingToDatabase, db, done){
    if(errorConnectingToDatabase) {
      console.log('Error connecting to the database.');
      res.sendStatus(500);
    } else {
      // We connected to the database!!!
      // Now we're going to GET things from the db
      var queryText = 'DELETE FROM "to_do_list"' +
                      'WHERE "user_id" = $1;';
      // errorMakingQuery is a bool, result is an object
      db.query(queryText, [id], function(errorMakingQuery, result){
        done();
        if(errorMakingQuery) {
          console.log('Attempted to query with', queryText);
          console.log('Error making query');
          res.sendStatus(500);
        } else {
          // console.log(result);
          // Send back the results
          res.sendStatus(200);
        }
      }); // end query
    } // end if
  }); // end pool
}); // end of PUT

module.exports = router;

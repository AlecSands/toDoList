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
      console.log('send request');
      res.sendStatus(200);
      // var queryText = 'SELECT * FROM "koalaholla" ORDER BY "name" DESC;';
      // errorMakingQuery is a bool, result is an object
      // db.query(queryText, function(errorMakingQuery, result){
      //   done();
      //   if(errorMakingQuery) {
      //     console.log('Attempted to query with', queryText);
      //     console.log('Error making query');
      //     res.sendStatus(500);
      //   } else {
      //     // console.log(result);
      //     // Send back the results
      //     res.send({koalas: result.rows});
      //   }
      // }); // end query
    } // end if
  }); // end pool
}); // end of GET

module.exports = router;

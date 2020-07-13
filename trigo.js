
var db = require('pg');
var dbConfig = require('./constants.js').DB_CONFIG;

var _connectionPool = null;

var getDBConnection = function() {

  if( _connectionPool != null ) 
    return _connectionPool.connect();

  _connectionPool = new db.Pool( dbConfig );
  var connection = _connectionPool.connect();

  connection.catch( error => {
      console.log( "PTS: @getDBConnection | NotOK:\n", error.stack );
    });

  return connection;
}


var _releaseConnectionFromPool = function( connection ) {
  if( _connectionPool != null ) {
    console.log( "@_releaseConnectionFromPool | _connectionPool != null" );
    connection.release();
    return;
  }
  console.log( "@_releaseConnectionFromPool | _connectionPool == null" );
  connection.end();
}


// PTS: normalize (lower-case) each key of a dictionary
var _keysToLowerCase = function( obj ) {
  if( obj != null ) {
    Object.keys( obj ).forEach( key => {
      var k = key.toLowerCase();
      if( k != key ) {
        var v = obj[ key ]
        obj[ k ] = v;
        delete obj[ key ];
        // console.log( k );
        if( typeof v == 'object' ) {
          _keysToLowerCase( v );
        }
      }
    });
  }
  return obj;
}


// ______________________________________________________________________________
// query
var query = function( query_string, params ) {
  console.log( "@data-acccess-postgres.query" );
  if( ! params ) params = []

  var poolDBConnection = getDBConnection()
    .then( connection => {
      console.log( "@data-acccess-postgres.query | query=", query_string );
      console.log( "@data-acccess-postgres.query | params=", params );

      var prm_query = connection.query( query_string, params );
      //, { outFormat: db.OBJECT, maxRows: 10000 }) // from Oracle

      return prm_query
        .then( result => {
          console.log( "@data-acccess-postgres.query | prm_query" );
          _releaseConnectionFromPool( connection );

          for (var i = 0; i < result.rows.length; i++) {
            result.rows[i] = _keysToLowerCase(result.rows[i]);
            // console.log(result.rows[i])
          }
          console.log( result.rows );
          return result.rows;
        })
        .catch( error => {
          _releaseConnectionFromPool( connection );
          console.log("PTS: prm_query-error>>" + error.message);
          return null;
        });
    })
    .catch( error => {
      console.log("PTS: poolDBConnection-error>>" + error.message);
  });

  return poolDBConnection;
}
const process = require('process');
const express = require("express");
const {Pool} = require('pg');
const router = express.Router();
router.use(express.json())

const connectWithTcp = () => {
    const dbSocketAddr = process.env.DB_HOST.split(":"); // e.g. '127.0.0.1:5432'
    return new Pool({
        user: process.env.DB_USER, // e.g. 'my-user'
        password: process.env.DB_PASSWORD, // e.g. 'my-user-password'
        database: process.env.DB_NAME, // e.g. 'my-database'
        host: dbSocketAddr[0], // e.g. '127.0.0.1'
        port: dbSocketAddr[1], // e.g. '5432'
        connectionTimeoutMillis: 60000,
        idleTimeoutMillis: 600000
    });
}

const connectWithUnixSockets = () => {
    const dbSocketPath = process.env.DB_SOCKET_PATH || "/cloudsql"
    return new Pool({
        user: process.env.DB_USER, // e.g. 'my-user'
        password: process.env.DB_PASSWORD, // e.g. 'my-user-password'
        database: process.env.DB_NAME, // e.g. 'my-database'
        host: `${dbSocketPath}/${process.env.DB_CONNECTION_NAME}`,
        connectionTimeoutMillis: 60000,
        idleTimeoutMillis: 600000
    });
}  

const connect = () => {
    let pool;
    if (process.env.DB_HOST) {
      pool = connectWithTcp();
    } else {
      pool = connectWithUnixSockets();
    }
    return pool;
  };
  
const pool = connect();

router.get("/parksnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        
        const client = await pool.connect();
        
        await client.query(`
        SELECT st_asgeojson(geo) as geo, nfreespots,
        ROUND(100-(nfreespots/nspots)*100) as Ocupado,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM park 
        WHERE nfreespots <> 0
        ORDER BY dist ASC limit 8`);

        client.release(true);
        
        res.status(200).json(query.rows)
      
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})

router.get("/parksnearme/:lat/:long/:dist", async(req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        var dist = req.params.dist;
        console.log([lat, long, dist])

        const query = await pool.query(`
        SELECT st_asgeojson(geo) as geo, nfreespots,
        ROUND(100 - (nfreespots/nspots)*100 ) as Ocupado,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM park 
        WHERE (nfreespots <> 0 AND ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 > ${dist})
        ORDER BY dist ASC limit 8`);

        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})


/*-----------QUERIES PLACES TAB---------*/
router.get("/placesnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        
        const query = await pool.query(`
        SELECT st_asgeojson(geo) as geo, name,
        about, category, photo_path,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM place 
        ORDER BY dist ASC limit 8`)

        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})


router.get("/placesnearme/:lat/:long/:dist", async(req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        var dist = req.params.dist;
        console.log([lat, long, dist])

        const query = await pool.query(`
        SELECT st_asgeojson(geo) as geo, name,
        about, category, photo_path,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM place 
        WHERE ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 > ${dist}
        ORDER BY dist ASC limit 8`);

        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})


/*-----------QUERIES NOTIF TAB TAB---------*/
router.get("/notifs/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;

        const query = await pool.query(`
        SELECT *,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),p.geo::geography))/1000 as dist
        FROM place as p JOIN notif as n
        ON n.idplace = p.id 
        WHERE CURRENT_DATE <= n.date_end
        ORDER BY dist ASC limit 8`
        );

        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})

router.get("/notifs/:lat/:long/:dist", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        var dist = req.params.dist;

        const query = await pool.query(`
        SELECT *
        FROM place as p JOIN notif as n
        ON n.idplace = p.id
        WHERE ( ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),p.geo::geography))/1000 > ${dist} 
        AND CURRENT_DATE <= n.date_end )
        ORDER BY ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),p.geo::geography))/1000 > ${dist} ASC limit 8`
        );

        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})





router.get("/parkInfo/:id", async (req, res) =>{
    try {
        const id = req.params.id.toString(); //req.body.id.toString();
        const query = await pool.query("SELECT nspots, nfreespots from park where id=$1", [id])
        res.status(200).json(query.rows)
    } catch (err) {
        console.error(err.message)
        res.status(400).send(error.message)
    }
})


router.get("/parkUpdate/:id/:nfreespots", async (req, res) =>{
    try {
        const id = req.params.id;
        const nfreespots = req.params.nfreespots;
        
        const query = await pool.query( `UPDATE park SET nfreespots=${nfreespots} WHERE id=${id}`);
        
        res.status(200).json(`park updated Succesfully with ${nfreespots} free spots `);
    } catch (err) { 
        console.error(err.message)
        res.status(400).send(error.message)
    }
})

/* codigo auxiliar


var conPool = null;

var getDBConnection = () => {
  if( conPool != null ) 
    return conPool.connect();

  conPool = new Pool( config.dbConfig );
  var connection = conPool.connect();

  connection.catch( error => {
      console.log( "getDBConnection: Error | NotOK:\n", error.stack );
    });
  return connection;
}

var releaseConnectionFromPool = ( connection ) => {
    if( _connectionPool != null ) {
        console.log( "releaseConnectionFromPool | connectionPool != null" );
        connection.release();
    }

    console.log( "releaseConnectionFromPool | connectionPool == null" );
    connection.end();
}


var query = (query_string) => {

    var poolDBConnection = getDBConnection()
    .then( connection => {
        console.log( "@data-acccess-postgres.query | query=", query_string );

        var prm_query = connection.query( query_string);
        
        return prm_query
        .then( result => {
            console.log( "@data-acccess-postgres.query | prm_query" );

            releaseConnectionFromPool( connection );

            console.log( result.rows );
            return result.rows;
        })
        .catch( error => {
          releaseConnectionFromPool( connection );
          console.log("PTS: prm_query-error>>" + error.message);
          return null;
        });
    })
    .catch( error => {
        console.log("PTS: poolDBConnection-error>>" + error.message);
    });

    return poolDBConnection;
}

*/

module.exports = router;
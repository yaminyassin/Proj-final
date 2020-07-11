const express = require("express");
const {Pool} = require('pg');

const config = require('./config');


const router = express.Router();
router.use(express.json())


const pool = new Pool({
    user: "postgres",
    password: "postgres",
    host: "192.168.99.100", //"35.240.79.47",
    database: "location",
    port: 5555 //5432
})

/*-----------QUERIES PARK TAB---------*/

router.get("/parksnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        console.log([lat, long])

        const query = await pool.query(`
        SELECT st_asgeojson(geo) as geo, nvagos,
        ROUND(100-(nvagos/nlugares)*100) as Ocupado,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM park 
        WHERE nvagos <> 0
        ORDER BY dist ASC limit 8`);

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
        SELECT st_asgeojson(geo) as geo, nvagos,
        ROUND(100 - (nvagos/nlugares)*100 ) as Ocupado,
        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
        FROM park 
        WHERE (nvagos <> 0 AND ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 > ${dist})
        ORDER BY dist ASC limit 5`);

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
        ORDER BY dist ASC limit 5`)

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
        ORDER BY dist ASC limit 5`);

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
        ORDER BY dist ASC limit 5`
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
        ORDER BY ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),p.geo::geography))/1000 > ${dist} ASC limit 5`
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
        const query = await pool.query("SELECT nlugares, nvagos from park where id=$1", [id])
        res.status(200).json(query.rows)
    } catch (err) {
        console.error(err.message)
        res.status(400).send(error.message)
    }
})


router.get("/parkUpdate/:id/:nvagos", async (req, res) =>{
    try {
        const id = req.params.id;
        const nvagos = req.params.nvagos;
        
        const query = await pool.query( `UPDATE park SET nvagos=${nvagos} WHERE id=${id}`);
        res.status(200).json(`park updated Succesfully with ${nvagos} free spots `);
    } catch (err) { 
        console.error(err.message)
        res.status(400).send(error.message)
    }
})

module.exports = router;
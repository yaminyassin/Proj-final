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
        
/*abaixo configuei cada tipo de link para devolver certos queries */

router.get("/parksnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        console.log([lat, long])
        const query = await pool.query(`SELECT st_asgeojson(geo) as geo, nvagos,
                                        ROUND(100-(nvagos/nlugares)*100) as Ocupado,
                                        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
                                        FROM park 
                                        WHERE nvagos <> 0
                                        ORDER BY dist ASC limit 8`)
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
        const query = await pool.query(`SELECT st_asgeojson(geo) as geo, nvagos,
                            ROUND(100 - (nvagos/nlugares)*100 ) as Ocupado,
                            ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
                            FROM park 
                            WHERE (nvagos <> 0 AND ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 > ${dist})
                            ORDER BY dist ASC limit 5`)
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


// atualizar BD
router.put("/parkUpdate/:id", async (req, res) =>{
    try {
        const id = req.params.id;
        const { nvagos } = req.body;
        const query = await pool.query( `UPDATE park SET nvagos=${nvagos} WHERE id=${id}`);
        res.status(200).json("parque foi atualizado");
    } catch (err) { 
        console.error(err.message)
        res.status(400).send(error.message)
    }
})

router.get("/park", async (req, res) =>{
    try{
        const query = await pool.query("SELECT * from park") 
        res.status(200).send(query.rows)  
    }catch(error){
        res.status(400).send(error.message)
    }
  
})

router.get("/placesnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        const query = await pool.query(`SELECT st_asgeojson(geo) as geo, name,
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
        const query = await pool.query(`SELECT st_asgeojson(geo) as geo, name,
                            about, category, photo_path,
                            ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 as dist 
                            FROM place 
                            WHERE ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geo::geography))/1000 > ${dist}
                            ORDER BY dist ASC limit 5`)
        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send(error.message)
    }
})

/*
post what you recieved
router.post('/parque', async (req, res)=>{
    res.setHeader('Content-Type', 'application/json')
    res.write('you posted: \n')
    res.end(JSON.stringify(req.body, null, 2))
    console.log(JSON.stringify(req.body, null, 2))

})

router.get('/teste', async (req, res) =>{
    try {
        const {id} = req.body;
        console.log(id)
        const query = await pool.query("select * from parque where id = $1", [id] )
        res.send(query.rows)
    } catch (error) {
        console.error(error.message)
    }
  
})

router.get('/parque/:id', async (req, res)=>{
    try {
        const id = req.params.id;
        console.log(id)
        const query = await pool.query("select * from parque where id = $1", [id] )
        res.send(query.rows)
    } catch (error) {
        console.error(error.message)
    }
})

router.delete('/parque/:id', async (req, res)=>{
    res.send()
})

*/


module.exports = router;
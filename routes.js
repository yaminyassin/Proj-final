const express = require("express");
const {Pool} = require('pg');


const router = express.Router();
router.use(express.json())


const pool = new Pool({
    user: "postgres",
    password: "SofiaYamin123",
    host: "localhost",
    database: "location",
    port: 5432
})
        
/*abaixo configuei cada tipo de link para devolver certos queries */

router.get("/parksnearme/:lat/:long", async (req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        console.log([lat, long])
        const query = await pool.query(`SELECT st_asgeojson(geom) as geo,
                                        ROUND((nvagos/nlugares)*100) as Ocupado,
                                        ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geom::geography))/1000 as dist 
                                        FROM parque 
                                        WHERE nvagos <> 0
                                        ORDER BY dist ASC limit 5`)
        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send('failed to get info')
    }
})


router.get("/parksnearme/:lat/:long/:dist", async(req, res) =>{
    try {
        var lat = req.params.lat;
        var long = req.params.long;
        var dist = req.params.dist;
        console.log([lat, long, dist])
        const query = await pool.query(`SELECT st_asgeojson(geom) as geo,
                            ROUND((nvagos/nlugares)*100) as Ocupado,
                            ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geom::geography))/1000 as dist 
                            FROM parque 
                            WHERE (nvagos <> 0 AND ROUND(st_distance(ST_SetSRID( ST_Point(${long}, ${lat})::geography, 4326),geom::geography))/1000 > ${dist})
                            ORDER BY dist ASC limit 5`)
        res.status(200).json(query.rows)
    } catch (error) {
        console.error(error.message)
        res.status(400).send('failed to get info')
    }
})

router.get("/parkInfo/:id", async (req, res) =>{
    try {
        const id = req.params.id.toString(); //req.body.id.toString();
        console.log(id);
        const query = await pool.query("SELECT nlugares, nvagos from parque where id=$1", [id])
        res.status(200).json(query.rows)
    } catch (err) {
        console.error(err.message)
        res.status(400).send("error nigga")
    }
})


// atualizar BD
router.put("/parkUpdate/:id", async (req, res) =>{
    try {
        const id = req.params.id;
        const { nvagos } = req.body;
        console.log([id, nvagos]);
        const query = await pool.query(
            "UPDATE parque SET nvagos=$1 WHERE id=$2", [nvagos, id]
        );
        res.status(200).json("parque foi atualizado");
    } catch (err) { 
        console.error(err.message)
        res.status(400).send("error nigga")
    }
})

router.get("/parque", async (req, res) =>{
    try{
        const query = await pool.query("SELECT * from parque") 
        res.status(200).send(query.rows)  
    }catch(e){
        res.status(400).send(e.message)
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
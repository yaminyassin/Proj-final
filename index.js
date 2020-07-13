
const config = require("./config");
const express = require ("express");
const routes = require('./routes');
const cors = require('cors');

const app = express();

app.use(cors())
app.use(express.json());
app.use('/movel', routes);

PORT = config.expressConfig.port;
HOST = config.expressConfig.hostname;

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(PORT, () =>
 console.log(`listening on port: ${PORT} !`)
);




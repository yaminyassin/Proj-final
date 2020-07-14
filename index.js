
const config = require("./config").expressConfig;
const express = require ("express");
const routes = require('./routes');


const app = express();

app.use(express.json());
app.use('/movel', routes);

PORT = config.port;
HOST = config.hostname;

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(PORT, () =>
 console.log(`listening on port: ${PORT} !`)
);




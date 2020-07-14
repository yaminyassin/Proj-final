const express = require ("express");
const routes = require('./routes');
const process = require('process');

const app = express();

app.use(express.json());
app.use('/movel', routes);

PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello World');
});


app.listen(PORT, () =>
 console.log(`listening on port: ${PORT} !`)
);




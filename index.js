const express = require ("express");
const cors = require('cors')

const routes = require('./routes');
const app = express();

app.use(cors())
app.use(express.json());
app.use('/movel', routes);

PORT =3000;


app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, () =>
 console.log(`listening on port: ${PORT} !`)
);




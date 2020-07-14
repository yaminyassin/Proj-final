const process = require('process');

const dbConfig = 
{
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS ||'postgres',
    database: process.env.DB_NAME || 'location',
    host:  process.env.DB_CONNECTION_NAME || "192.168.99.100",
    port: process.env.DB_PORT || 5555
};

const queryConfig = 
{
  limit: 8, 
  srid:4326
}

const expressConfig = {
  port: process.env.PORT || 8080,
  hostname: process.env.HOST || '192.168.99.100'
}
  
module.exports = {
  dbConfig,
  queryConfig,
  expressConfig
}


const dbConfig = 
{
    user: 'postgres',
    host: "192.168.99.100",
    database: 'location',
    password: 'postgres',
    port: 5555
};

const queryConfig = 
{
  limit: 8, 
  srid:4326
}

const expressConfig = {
  port:3000,
  hostname: '192.168.99.100'
}
  
module.exports = {
  dbConfig,
  queryConfig,
  expressConfig
}
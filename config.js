

const dbConfig = 
{
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS ||'postgres',
    database: process.env.DB_NAME || 'location',
    host:  "192.168.99.100",
    port: 5432
};

const queryConfig = 
{
  limit: 8, 
  srid:4326
}

const expressConfig = {
  port: process.env.PORT || 8080,
  hostname: '192.168.99.100'
}
  
module.exports = {
  dbConfig,
  queryConfig,
  expressConfig
}
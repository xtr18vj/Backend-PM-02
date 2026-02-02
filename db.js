const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mahayog",
  password: "simran@19",
  port: 5432,
});

module.exports = pool;
;
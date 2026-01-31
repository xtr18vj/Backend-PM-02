const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "projectdb",
  password: "Ujvala21@",
  port: 5432,
});

module.exports = pool;
;
require("dotenv").config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "tg_gym",
});

module.exports = pool;
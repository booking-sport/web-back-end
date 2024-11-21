// Update with your config settings.
require("dotenv").config();

module.exports = {

  development: {
    client: "mysql2",
    useNullAsDefault: true,
    connection: {
      host: process.env.MYSQL_DEV_HOST,
      port: process.env.MYSQL_DEV_PORT,
      user: process.env.MYSQL_DEV_USER,
      password: process.env.MYSQL_DEV_PASSWORD,
      database: process.env.MYSQL_DEV_DATABASE
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./database/migrations"
    },
    seeds: {
      directory: "./database/seeds"
    }
  },

};
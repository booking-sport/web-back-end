const knex = require('knex');
const knexConfigFile = require('../../knexfile');

module.exports = knex(knexConfigFile['development']);
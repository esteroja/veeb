const mysql = require('mysql2');
const dbInfo = require('../../../vp23config');

const pool = mysql.createPool({
    host: dbInfo.configData.host, 
    user: dbInfo.configData.user, 
    password: dbInfo.configData.password,
    database: dbInfo.configData.database,
    connectionLimit: 5
});

exports.pool = pool;
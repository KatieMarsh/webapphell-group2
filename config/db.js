const mysql = require('mysql2');

const con = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    // database:'webpro'
    database:'web_project'
});

module.exports = con;
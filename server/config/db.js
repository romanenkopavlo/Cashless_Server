import mysql from "mysql2/promise"

const mySqlPool = mysql.createPool( {
    host: process.env.MYSQL,
    user: 'root',
    password: 'root',
    database: 'festival_proto'
})

export default mySqlPool;
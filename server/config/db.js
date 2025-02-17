import mysql from "mysql2/promise"

const mySqlPool = mysql.createPool( {
    host: process.env.MYSQL,
    user: 'root',
    password: '',
    database: 'festival_proto'
})

export default mySqlPool;
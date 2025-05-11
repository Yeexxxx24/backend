// 数据库模型

// 加载mysql2和dotenv
const mysql = require('mysql2');
require('dotenv').config(); //加载.env文件中的环境变量

//创建连接池
const pool = mysql.createPool({
  host:process.env.DB_HOST,
  port:process.env.DB_PORT,
  user:process.env.DB_USER,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
});

//导出连接池
const db = pool.promise();
module.exports = db;
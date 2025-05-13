// 引入express框架
const express = require('express')
// 引入cors（解决前后端跨域问题）
const cors = require('cors')
// 引入dotenv加载.env中的环境变量
require('dotenv').config()
// 创建express应用实例
const app = express()

// 中间件，允许JSON格式请求体（req.body)
app.use(express.json())


//中间件：启用 CORS（解决前端调用接口时的跨域问题）
app.use(cors())

// 路由中间件：挂载用户接口模块，以api开头
const userRouter = require('./routes/user')
app.use('/api',userRouter)

const uploadRouter = require('./routes/upload')
app.use('/api',uploadRouter)

// 获取端口号 从.evn获取
const PORT = process.env.PORT || 3000

// 启动服务，监听接口
app.listen(PORT,()=>{
  console.log(`服务器已启动：http://localhost:${PORT}"`)
})
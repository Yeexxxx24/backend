// 引入express框架
const express = require('express')
// 创建一个路由对象
const router = express.Router()

// 引入控制器中处理注册逻辑的函数
const userController = require('../controllers/userController')

// 注册接口：当收到POST请求到/register时，调用userController中的register方法
router.post('/register',userController.register)
// 登录接口
router.post('/login',userController.login)

// 导出模块，供app.js使用
module.exports = router


const checkToken = require('../middlewares/auth')

router.get('/me', checkToken, (req, res) => {
  res.json({
    code: 200,
    message: '身份验证成功',
    user: req.user // 👈 就能看到 token 解出来的用户信息了
  })
})
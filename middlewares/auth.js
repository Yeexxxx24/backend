// middlewares/auth.js
const jwt = require('jsonwebtoken')

// 鉴权中间件：检查请求头中的 token 是否有效
function checkToken(req, res, next) {
  const authHeader = req.headers.authorization // 从请求头取出 Authorization 字段

  // 如果没有携带 token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录，或 token 缺失' })
  }

  // 提取 token 内容
  const token = authHeader.split(' ')[1] // 'Bearer token值' => ['Bearer', 'token值']

  try {
    // 校验 token 是否有效，并解密出用户信息
    const decoded = jwt.verify(token, 'secretkey') // 建议后续从 .env 中读取

    // 把用户信息挂到 req.user 上，后续接口就可以直接用 req.user.xxx
    req.user = decoded

    next() // 放行，继续执行后面的接口处理逻辑
  } catch (err) {
    return res.status(401).json({ message: '无效或过期的 token' })
  }
}

module.exports = checkToken

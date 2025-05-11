
const db = require('../models/db') //引入数据库连接模块
const jwt = require('jsonwebtoken') //引入JWT用于生成token
const bcrypt = require('bcryptjs')


// 注册处理函数
exports.register = async(req,res)=>{
  const {username,password} =req.body
  console.log(' 收到注册请求:', username, password)
  if(!username || !password){
    return res.status(400).json({code:400,message:'用户名或密码不能为空'})
  }

  try{
    // 检查用户名是否已存在
    console.log(' 检查用户名是否存在...')
    const [rows] = await db.query('SELECT * FROM user WHERE username=?',[username])
    console.log('🔍 查询结果:', rows)
    if(rows.length>0){
      return res.status(409).json({code:409,message:'用户名已存在'})
    }

    // 对密码加密
    const hashedPassword = await bcrypt.hash(password, 10)

    //写入数据库
    console.log(' 插入新用户...')
    await db.query('INSERT INTO user (username,password,role) VALUES(?,?,?)',
      [username,hashedPassword,'student'] //默认角色是学生]
    )
    console.log(' 注册成功！')
    // 成功后返回200和提示信息
    return res.json({code:200,message:'注册成功'})

  }
  catch(err){
    console.error('发生错误:', err)
    res.status(500).json({code:500,message:'服务器错误'})

  }
}

// 登录处理函数
exports.login = async (req,res) => {
  const {username,password} = req.body
  console.log("收到登录请求：",username)
  
  if (!username || !password) {
    return res.status(400).json({ code: 400, message: '用户名或密码不能为空' })
  }

  try {
    // 检查数据库
    const [rows] = await db.query(
      'SELECT * FROM user WHERE username = ?',
      [username]
    )

    if(rows.length === 0){
      return res.status(404).json({code:404,message:'用户不存在'})
    }
    const user = rows[0]

    const isMatch = await bcrypt.compare(password,user.password)

    if (!isMatch) {
      return res.status(401).json({ code: 401, message: '密码错误' })
    }

    // 密码验证通过，生成JWT token
    const token = jwt.sign(
      {
        id:username.id,
        username:user.username,
        role:user.role
      },
      'secrekey', //签名密钥     
      {expiresIn:'2h'} //2小时后过期
    )
    console.log('登录成功：',user.username)

    return res.json({
      code:200,
      message:'登录成功',
      token,
      username:user.username,
      role:user.role
    })
  } catch (error) {
     console.error('登录时发生错误:', err)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
}
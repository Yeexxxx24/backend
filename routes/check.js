const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()
const db = require('../models/db') // ✅ 引入数据库连接

// 简易相似度计算
function calculateSimilarity(content1, content2) {
  const len = Math.max(content1.length, content2.length)
  if (len === 0) return 100
  let same = 0
  for (let i = 0; i < Math.min(content1.length, content2.length); i++) {
    if (content1[i] === content2[i]) same++
  }
  return ((same / len) * 100).toFixed(1)
}

router.post('/', async (req, res) => {
  const { filename, userId } = req.body // 👈 前端要传 userId
  const uploadDir = path.join(__dirname, '../uploads')
  const uploadPath = path.join(uploadDir, filename)

  if (!fs.existsSync(uploadPath)) {
    return res.status(400).json({ code: 400, message: '文件不存在' })
  }

  const currentContent = fs.readFileSync(uploadPath, 'utf-8')
  const files = fs.readdirSync(uploadDir)

  let maxSimilarity = 0
  let matchedFile = ''

  for (const file of files) {
    const filePath = path.join(uploadDir, file)
    if (file !== filename && fs.lstatSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath, 'utf-8')
      const similarity = calculateSimilarity(currentContent, content)
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity
        matchedFile = file
      }
    }
  }

  // ✅ 插入查重记录到 check_history 表
  try {
    await db.query(
      'INSERT INTO check_history (user_id, filename, matched_file, similarity) VALUES (?, ?, ?, ?)',
      [userId, filename, matchedFile, maxSimilarity]
    )
    console.log('📄 查重记录已写入数据库')
  } catch (err) {
    console.error('❌ 写入查重记录失败:', err)
  }

  // ✅ 返回查重结果
  res.json({
    code: 200,
    message: '查重成功',
    similarity: maxSimilarity,
    matchedFile
  })
})


// 分页获取所有查重记录（仅限教师）
router.get('/all',async (req,res) => {
  //page：表示当前请求的是第几页 pageSize：表示每页显示多少条记录
  // = 1 和 = 5 是默认值，即如果前端没传这两个参数，就使用默认：第 1 页、每页 5 条
  const {page = 1,pageSize = 5} = req.query
  const offset = (page-1)*pageSize
  try {
    // 查询check_history表并关联user表，获取学生用户名
    const [records] = await db.query(`
      SELECT u.username,c.filename,c.matched_file,c.similarity,c.create_at
      FROM check_history c
      JOIN user u ON c.user_id = u.id
      ORDER BY c.create_at DESC
      LIMIT ? OFFSET ?
      `,
    [Number(pageSize),Number(offset)]
    )

    // 获取总条数
    const [countResult] = await db.query(`SELECT COUNT(*) AS total FROM check_history`)

    res.json({
      code:200,
      data:{
        records,
        total:countResult[0].total
      }
    })
  } catch (error) {
    console.error('教师获取查重记录失败：',error)
    res.status(500).json({code:500,message:'服务器错误'})
  }
})


//查重记录接口（学生）
router.get('/history',async(req,res) => {
  const {userId,page = 1, pageSize = 5} = req.query
  const offset = (page - 1)*pageSize

  try {
    // 获取当前页数据
    const [rows] = await db.query(
      `SELECT filename,matched_file,similarity,create_at
      FROM check_history
      WHERE user_id = ?
      ORDER BY create_at DESC
      LIMIT ? OFFSET ?`,
      [userId,Number(pageSize),Number(offset)]
    )

    // 获取总条数
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM check_history WHERE user_id = ?`,
      [userId]
    )

    res.json({
      code:200,
      data:{
        records:rows,
        total:countResult[0].total
      }
    })
  } catch (error) {
     console.error('❌ 查询查重记录失败:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }

})

module.exports = router

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../models/db");
const router = express.Router();

// 配置multer上传路径
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../submissions");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const unique = Date.now() + "-" + Math.floor(Math.random() * 1000);
    cb(null, `${name}-${unique}${ext}`);
  },
});

const upload = multer({ storage })

// 提交作业接口
router.post('/', upload.single('file'), async (req, res) => {
  const { assignmentId, studentId } = req.body
  const file = req.file

  if (!file || !assignmentId || !studentId) {
    return res.status(400).json({ code: 400, message: '缺少必要信息' })
  }

  try {
    await db.query(
      `INSERT INTO submission (assignment_id, student_id, filename) VALUES (?, ?, ?)`,
      [assignmentId, studentId, file.filename]
    )
    res.json({ code: 200, message: '作业提交成功' })
  } catch (err) {
    console.error('提交失败:', err)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

// 查询学生是否已提交某个作业
router.get('/status', async (req, res) => {
  const { assignmentId, studentId } = req.query
  if (!assignmentId || !studentId) {
    return res.status(400).json({ code: 400, message: '缺少参数' })
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM submission WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    )

    res.json({
      code: 200,
      data: { submitted: rows.length > 0 }
    })
  } catch (error) {
    console.error('查询提交状态失败:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})
module.exports = router

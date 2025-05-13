const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const iconv = require('iconv-lite')  // 👈 先引入模块


const router = express.Router()

// 设置存储目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath)
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    // ✅ 手动转码原始文件名
    const utf8OriginalName = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8')

    const ext = path.extname(utf8OriginalName)
    const name = path.basename(utf8OriginalName, ext)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  }
})

const upload = multer({ storage })

// 接收上传文件
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '未收到文件' })
  }

  // console.log('📦 接收到文件：', req.file.filename)
  const originalName = iconv.decode(Buffer.from(req.file.originalname, 'binary'), 'utf8')

  res.json({
    code: 200,
    message: '上传成功',
    filename: req.file.filename, //系统保存用的唯一文件名
    originalName:originalName //原始文件名（带中文）
  })
})

module.exports = router

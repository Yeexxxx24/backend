const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const iconv = require("iconv-lite");

const router = express.Router();

// 设置上传目录
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// multer配置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // 避免乱码：先解码
    const decodedName = iconv.decode(Buffer.from(file.originalname, "latin1"), "utf8");
    const ext = path.extname(decodedName);
    const name = path.basename(decodedName, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const finalName = `${name}-${uniqueSuffix}${ext}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: "未收到文件" });
  }

  // 重新解码原始文件名
  const originalName = iconv.decode(Buffer.from(req.file.originalname, "latin1"), "utf8");

  res.json({
    code: 200,
    message: "上传成功",
    filename: req.file.filename,
    originalName: originalName,
  });
});

module.exports = router;

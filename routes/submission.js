const express = require("express");
const router = express.Router();
const db = require("../models/db");
const multer = require("multer");

const upload = multer(); // 无文件，仅处理字段

// 学生提交作业（只记录文件名和原始名）
router.post("/", upload.none(), async (req, res) => {
  const { studentId, assignmentId, filename, originalName } = req.body;

  if (!studentId || !assignmentId || !filename || !originalName) {
    return res.status(400).json({ code: 400, message: "缺少参数" });
  }

  try {
    await db.query(
      `INSERT INTO submission (student_id, assignment_id, filename, original_name, submitted_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [studentId, assignmentId, filename, originalName]
    );
    res.json({ code: 200, message: "提交成功" });
  } catch (error) {
    console.error("提交失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// 查询提交状态
router.get("/status", async (req, res) => {
  const { assignmentId, studentId } = req.query;

  if (!assignmentId || !studentId) {
    return res.status(400).json({ code: 400, message: "缺少参数" });
  }

  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS count FROM submission WHERE assignment_id = ? AND student_id = ?",
      [assignmentId, studentId]
    );
    res.json({ code: 200, data: { submitted: rows[0].count > 0 } });
  } catch (error) {
    console.error("查询状态失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// 教师查看提交记录
router.get("/list", async (req, res) => {
  const { assignmentId } = req.query;

  if (!assignmentId) {
    return res.status(400).json({ code: 400, message: "缺少 assignmentId 参数" });
  }

  try {
    const [students] = await db.query(
      `SELECT id AS studentId, username AS studentName FROM user WHERE role = 'student'`
    );

    const [submissions] = await db.query(
      `SELECT student_id AS studentId, filename, original_name, submitted_at
       FROM submission
       WHERE assignment_id = ?`,
      [assignmentId]
    );

    const map = new Map();
    submissions.forEach((s) => map.set(s.studentId, s));

    const result = students.map((stu) => {
      const sub = map.get(stu.studentId);
      return {
        studentId: stu.studentId,
        studentName: stu.studentName,
        filename: sub?.filename || null,
        originalName: sub?.original_name || null,
        submittedAt: sub?.submitted_at || null,
      };
    });

    res.json({ code: 200, data: result });
  } catch (error) {
    console.error("获取提交记录失败：", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

module.exports = router;

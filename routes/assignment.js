const express = require("express");
const router = express.Router();
const db = require("../models/db");

// POST /api/assignment 发布新作业（仅限教师）
router.post("/publish", async (req, res) => {
  const { title, description, deadline, teacherId } = req.body;
  if (!title || !deadline) {
    return res
      .status(400)
      .json({ code: 400, message: "标题和截止日期不能为空" });
  }

  try {
    await db.query(
      "INSERT INTO assignment (title, description, deadline,teacher_id) VALUES (?,?, ?, ?)",
      [title, description, deadline, teacherId]
    );
    res.json({ code: 200, message: "发布成功" });
  } catch (err) {
    console.error("发布失败:", err);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// 获取教师发布的所有作业
router.get("/list", async (req, res) => {
  const { teacherId } = req.query;

  if (!teacherId) {
    return res.status(400).json({ code: 400, message: "缺少教师ID" });
  }

  try {
    const [rows] = await db.query(
      `SELECT id,title,description,deadline,create_at
      FROM assignment
      WHERE teacher_id=?
      ORDER BY create_at DESC`,
      [teacherId]
    );

    res.json({
      code: 200,
      data: rows,
    });
  } catch (error) {
    console.error("获取作业列表失败", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// 教师修改作业
router.post("/update", async (req, res) => {
  const { id, title, description, deadline } = req.body;
  if (!id || !title || !deadline) {
    return res.status(400).json({ code: 400, message: "缺少必要字段" });
  }

  try {
    await db.query(
      "UPDATE assignment SET title = ?,description = ?,deadline=? WHERE id =?",
      [title, description, deadline, id]
    );
    res.json({ code: 200, message: "修改成功" });
  } catch (error) {
    console.error("修改失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
});

// 教师删除作业
router.delete('/:id',async(req,res) => {
  const assignmentId = req.params.id
  
  try {
    await db.query('DELETE FROM assignment WHERE id = ?',[assignmentId])
    res.json({code:200,message:'删除成功'})
  } catch (error) {
    console.error('删除作业失败',error)
    res.status(500).json({code:500,message:'服务器错误'})
  }
})

// 学生获取所有作业
router.get('/all',async(req,res) => {
  try {
    const [rows] = await db.query('SELECT *FROM assignment ORDER BY deadline DESC')
    res.json({
      code:200,
      data:rows
    })
  } catch (error) {
    console.error('获取作业失败：',error)
    res.status(500).json({code:500,message:'服务器错误'})
    
  }
})
module.exports = router;

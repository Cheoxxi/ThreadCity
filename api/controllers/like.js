import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req, res) => { 
  const q = 'SELECT userId FROM likes WHERE postId = ?';

  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data.map(like=>like.userId));
  });
};
export const addLikes = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token không khả dụng!");
  
      const q = "INSERT INTO likes (userId, postId) VALUES (?)";  // Sửa dấu nháy
      const values = [userInfo.id, req.body.postId];
  
      db.query(q, [values], (err, data) => {
        if (err) {
          console.error("Lỗi insert:", err);
          return res.status(500).json(err);
        }
        return res.status(200).json("Bài viết đã được thích");
      });
    });
  };
  
  export const deleteLikes = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token không khả dụng!");
  
      const q = "DELETE FROM likes WHERE userId = ? AND postId = ?";  // Sửa dấu nháy
      db.query(q, [userInfo.id, req.query.postId], (err, data) => {
        if (err) {
          console.error("Lỗi delete:", err);
          return res.status(500).json(err);
        }
        return res.status(200).json("Đã bỏ thích");
      });
    });
  };

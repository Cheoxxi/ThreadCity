import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getRelationships = (req, res) => { 
  const q = 'SELECT followerUserId FROM relationships WHERE followedUserId = ?';    

  db.query(q, [req.query.followedUserId], (err, data) => {
    if (err) {
      console.error('Lỗi truy vấn:', err);
      return res.status(500).json(err);
    }
    return res.status(200).json(data.map(relationship=>relationship.followerUserId));
  });
};
export const addRelationship = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token không khả dụng!");
  
      const q = "INSERT INTO relationships (`followerUserId`, `followedUserId`) VALUES (?)";  // Sửa dấu nháy
      const values = [
        userInfo.id, 
        req.body.userId
      ];
  
      db.query(q, [values], (err, data) => {
        if (err) {
          console.error("Lỗi insert:", err);
          return res.status(500).json(err);
        }
        return res.status(200).json("Đang theo dõi");
      });
    });
  };
  
  export const deleteRelationship = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token không khả dụng!");
  
      const q = "DELETE FROM relationships WHERE `followerUserId` = ? AND `followedUserId` = ?";  
      db.query(q, [userInfo.id, req.query.userId], (err, data) => {
        if (err) {
          console.error("Lỗi delete:", err);
          return res.status(500).json(err);
        }
        return res.status(200).json("Bỏ theo dõi");
      });
    });
  };

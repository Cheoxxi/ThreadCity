import {db} from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {
    const userId = req.query.userId;
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token ko khả dụng!");



        // Nếu có userId, chỉ lấy bài viết của userId đó
        const q = 
            userId !=="undefined"
            ? `SELECT p.*, u.id AS userId, u.name, u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
            : `SELECT p.*, u.id AS userId, u.name, u.profilePic 
               FROM posts AS p 
               JOIN users AS u ON u.id = p.userId
               LEFT JOIN relationships AS r ON (p.userId = r.followedUserId) 
               WHERE r.followerUserId = ? OR p.userId = ? 
               ORDER BY p.createdAt DESC`;

        const values = userId !=="undefined" ? [userId] : [userInfo.id, userInfo.id];

        db.query(q, values, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data);
        });
    });
};
export const addPost = (req,res)=>{
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("Chưa đăng nhập");

    jwt.verify(token, "secretkey", (err, userInfo)=>{
        if(err) return res.status(403).json("Token ko khả dụng!");
        
        const q = 'INSERT INTO posts (`desc`, `img`, `userId`, `createdAt`) VALUES (?, ?, ?, ?)';

        const values = [
            req.body.desc,
            req.body.img,
            userInfo.id,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
]

    db.query(q, values, (err, data) => {
    if (err) {
        console.error('Lỗi insert:', err);
        return res.status(500).json(err);
    }
    return res.status(200).json("Bài viết đã được đăng");
        });
    });
};
export const deletePost = (req,res)=>{
    const token = req.cookies.accessToken;
    if(!token) return res.status(401).json("Chưa đăng nhập");

    jwt.verify(token, "secretkey", (err, userInfo)=>{
        if(err) return res.status(403).json("Token ko khả dụng!");
        
        const q = "DELETE FROM posts WHERE `id`= ? AND `userId`=? ";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
        if (err) {console.error('Lỗi insert:', err); return res.status(500).json(err);}
        if(data.affectedRows>0) return res.status(200).json("Bài viết đã được xoá");
        return res.status(403).json("Bạn chỉ có thể xoá bài viết của bạn ")
    });
 });
};
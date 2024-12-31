import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getComments = (req, res) => {
    if (!req.query.postId) return res.status(400).json("Thiếu postId");

    const q = `
        SELECT c.*, u.id AS userId, u.name, u.profilePic
        FROM comments AS c
        JOIN users AS u ON u.id = c.userId
        WHERE c.postId = ?
        ORDER BY c.createdAt DESC
    `;

    db.query(q, [req.query.postId], (err, data) => {
        if (err) return res.status(500).json({ message: "Lỗi khi lấy bình luận", error: err });
        return res.status(200).json(data);
    });
};

export const addComment = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Chưa đăng nhập");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json({ message: "Token không khả dụng!", error: err });

        if (!req.body.desc || !req.body.postId) {
            return res.status(400).json("Thiếu dữ liệu bình luận");
        }

        const q = `
            INSERT INTO comments (\`desc\`, userId, createdAt, postId)
            VALUES (?, ?, ?, ?)
        `;
        const values = [
            req.body.desc,
            userInfo.id,
            moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            req.body.postId,
        ];

        db.query(q, values, (err, data) => {
            if (err) {
                console.error("Lỗi khi thêm bình luận:", err);
                return res.status(500).json({ message: "Không thể thêm bình luận", error: err });
            }
            return res.status(200).json("Bình luận đã được đăng");
        });
    });
};

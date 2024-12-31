import { db } from "../connect.js";
import  bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    // Kiểm tra người dùng nếu nó hiện hữu
    const q = "SELECT * FROM users WHERE username = ?";
  
    db.query(q, [req.body.username], (err, data) => {
      if (err) return res.status(500).json({ error: "Lỗi máy chủ", details: err });
      if (data.length) return res.status(409).json({ message: "Người dùng đã tồn tại!" });
  
      // Tạo người dùng mới
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).json({ error: "Lỗi khi tạo salt", details: err });
  
        bcrypt.hash(req.body.password, salt, (err, hashedPassword) => {
          if (err) return res.status(500).json({ error: "Lỗi khi mã hóa mật khẩu", details: err });
  
          const insertQuery = "INSERT INTO users (username, email, password, name) VALUES (?)";
          const values = [
            req.body.username,
            req.body.email,
            hashedPassword,
            req.body.name,
          ];
  
          db.query(insertQuery, [values], (err, result) => {
            if (err) return res.status(500).json({ error: "Lỗi khi chèn người dùng", details: err });
            return res.status(200).json({ message: "Người dùng đã được tạo thành công." });
          });
        });
      });
    });
  };
export  const login = (req,res)=>{

    const q ="SELECT * FROM users WHERE username = ?"

    db.query(q,[req.body.username], (err,data)=>{
        if (err) return res.status(500).json(err);
        if(data.length ===0) return res.status(404).json("Người dùng không được tìm thấy!");

        const checkPassword = bcrypt.compareSync(req.body.password, data[0].password);

        if(!checkPassword) return res.status (400).json("Sai mật khẩu hoặc tên đăng nhập")

        const token = jwt.sign({id:data[0].id},  "secretkey");

        const {password, ...other}=data[0]

        res.cookie("accessToken", token,{
            httpOnly : true,
        }).status(200)
          .json(other);
    });

};


export  const logout = (req,res)=>{
  res.clearCookie("accessToken",{
    secure:true,
    samneSite:"none"
  }).status(200).json("Người dùng đã được đăng xuất.")
};
 const express = require('express');
 const path = require('path');
 const bcrypt = require("bcrypt");
 const con = require('./config/db');

 const app = express();
 app.use("/public", express.static(path.join(__dirname, "public")));
 //for JS exchange
 app.use(express.json());
 app.use(express.urlencoded({ extended: true }));

// ---------- login -----------
app.post('/login', function (req, res) {
    const {username, password} = req.body;
    const sql = 'SELECT user_id, email, password, role FROM user WHERE email=?';
    con.query(sql, [username],function(err, results){
        if(err){
            console.error(err);
            res.status(500).send('DB error');
        }
        else if(results.length != 1){
            res.status(401).send('Username not found');
        }
        else{
            // raw: password
            // hash: results[0].password
            bcrypt.compare(password, results[0].password, function(err, same){
                if(err){
                    res.status(500).send('Password compare error');
                }
                else{
                    if(same){
                        res.send('Login successfully');
                    }
                    else{
                        res.status(401).send('wrong password');
                    }
                }
            })
        }
    })
});

// ---------- Register -----------
app.post('/sign-up', function (req,res) {
    const {user_id,email,password,conpassword,name,phone} = req.body;
        bcrypt.hash(password, 10 ,function (err,hash) {
            console.log(hash);
            if(err) {
                return res.status(500).send("Hash error!");
            }
            const findemail = 'SELECT email FROM user WHERE email = ?'
            con.query(findemail,[email], function(err,results){
                if (err) {
                    console.error(err);
                    res.status(500).send("Server error!");
                } 
                else if (results.length > 0) {
                    res.status(401).send("Email has already used!");
                }
                else {
                    if(password !== conpassword) {
                        return res.status(401).send('Password miss match!')
                    }
                    const sql = `INSERT INTO user (user_id, email, password, name, phone, role) VALUES(?,?,?,?,?,1)`;
                    con.query(sql,[user_id,email,hash,name,phone,] ,function (err,results) {
                        if(err) {
                            console.error(err);
                            res.status(500).send("Server error insert data!");
                        }
                        else {
                            res.send("project")
                        }
                    
                    })
                }
            })
        }) 
});




// API endpoint สำหรับการดึงข้อมูลห้อง
app.get('/room', (req, res) => {
  // ดึงข้อมูลห้องจากฐานข้อมูล
  con.query('SELECT * FROM room', (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องจากฐานข้อมูล:',err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});


app.post('/update_room_status', function (req,res) {
    const {room_id,status} = req.body;
    // const  booking_id = req.params.id;
    // const status = req.params.status;
    // UPDATE `booking` SET `status` = 'approved' WHERE `booking`.`booking_id` = 1
    const sql = `UPDATE room SET status = ? WHERE room.room_id = ?`;
    con.query(sql,[status,room_id] ,function (err,results) {
        if(err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send("update success")
        }
    })
});


// Root service
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Login.html'));
});
// Register service
app.get('/register', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Sign_up.html'));
}); 

 const port = 3000;
 app.listen(port, function () {
     console.log('Server is ready at' + port);
});
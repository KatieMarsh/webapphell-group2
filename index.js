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

// Browse Room For User and Anmin

app.use(bodyParser.json());

// กำหนดการเชื่อมต่อกับ MySQL
const connection = mysql.createConnection({
  host: 'your-mysql-host',
  user: 'your-mysql-username',
  password: 'your-mysql-password',
  database: 'your-database-name',
});

// ทดสอบการเชื่อมต่อ
connection.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MySQL:', err);
  } else {
    console.log('เชื่อมต่อกับ MySQL สำเร็จ');
  }
});


// API endpoint สำหรับการดึงข้อมูลห้อง
app.get('/web/room', (req, res) => {
  // ดึงข้อมูลห้องจากฐานข้อมูล
  connection.query('SELECT * FROM rooms', (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลห้องจากฐานข้อมูล:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});

// API endpoint สำหรับการจองห้อง
app.post('/web/booking', (req, res) => {
  const { roomId, timeslot } = req.body;

  // ค้นหาห้องในข้อมูล
  connection.query('SELECT * FROM rooms WHERE id = ?', [roomId], (err, results) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการค้นหาห้องจากฐานข้อมูล:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
      return;
    }

    const room = results[0];

    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // ตรวจสอบว่า timeslot ว่างหรือไม่
    if (!room.timeslots) {
      room.timeslots = [];
    }

    if (room.timeslots.includes(timeslot)) {
      return res.status(400).json({ success: false, message: 'Timeslot is already booked' });
    }

    // จอง timeslot
    room.timeslots.push(timeslot);

    // อัปเดตข้อมูล (ในแอปพลิเคชันจริงคุณต้องอัปเดตฐานข้อมูล)
    connection.query('UPDATE rooms SET timeslots = ? WHERE id = ?', [JSON.stringify(room.timeslots), roomId], (err) => {
      if (err) {
        console.error('เกิดข้อผิดพลาดในการอัปเดตข้อมูลห้อง:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
        return;
      }

      res.json({ success: true, message: 'Room booked successfully' });
    });
  });
});

// API endpoint สำหรับการเพิ่มห้องใหม่
app.post('//addroom', (req, res) => {
  const { name, capacity, location } = req.body;

  // เพิ่มโลจิกของคุณเพื่อเพิ่มห้องใหม่ลงในฐานข้อมูล
  connection.query('INSERT INTO rooms (name, capacity, location) VALUES (?, ?, ?)', [name, capacity, location], (err) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มห้องใหม่:', err);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
      return;
    }

    res.json({ success: true, message: 'Room added successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
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
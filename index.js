const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');

const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
//for JS exchange
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ---------- for session -----------
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 100 },
    secret: 'mysecretcode',
    resave: false,
    saveUninitialized: true
}));


// ---------- login -----------
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = 'SELECT user_id, email, password, role FROM user WHERE email=?';
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else if (results.length != 1) {
            res.status(401).send('Username not found');
        }
        else {
            // raw: password
            // hash: results[0].password
            bcrypt.compare(password, results[0].password, function (err, same) {
                if (err) {
                    res.status(500).send('Password compare error');
                }
                else {
                    if (same) {
                        res.send('Login successfully');
                    }
                    else {
                        res.status(401).send('wrong password');
                    }
                }
            })
        }
    })
});


// ---------- Register -----------

app.post('/register', function (req, res) {
    const { user_id, email, password, conpassword, name, phone } = req.body;
    bcrypt.hash(password, 10, function (err, hash) {
        console.log(hash);
        if (err) {
            return res.status(500).send("Hash error!");
        }
        const findemail = 'SELECT email FROM user WHERE email = ?'
        con.query(findemail, [email], function (err, results) {
            if (err) {
                console.error(err);
                res.status(500).send("Server error!");

            }
            else if (results.length > 0) {
                res.status(401).send("Email has already used!");
            }
            else {
                if (password !== conpassword) {
                    return res.status(401).send('Password miss match!')
                }
                const sql = `INSERT INTO user (user_id, email, password, name, phone, role) VALUES(?,?,?,?,?,1)`;
                con.query(sql, [user_id, email, hash, name, phone,], function (err, results) {
                    if (err) {
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
// ===== adroom =====
app.get('/addroom', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/addroom.html'));
});

// ---------- My Booking -----------
app.get("/my-booking/getbooking", function(_req, res){
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.user_id = 'sss';";
    con.query(sql, function (err, results){
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else {
            res.send(results);
        }
    })
});

app.get('/my-booking', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/My_Booking.html'));
});

// ===== Dasboard =====
// Dashboard service
app.get('/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/dashboard.html'));
});
// Datetime service
app.get("/now", function(_req, res){
    const dt = new Date().toLocaleString();
    res.send(dt);
});
// GET dashboard info
app.get('/dashboard/getdashboard', function (_req, res){
    const sql = "SELECT SUM(CASE WHEN time_slot_1 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_1,SUM(CASE WHEN time_slot_1 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_1,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_1,SUM(CASE WHEN time_slot_2 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_2,SUM(CASE WHEN time_slot_2 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_2,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_2,SUM(CASE WHEN time_slot_3 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_3,SUM(CASE WHEN time_slot_3 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_3,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_3,SUM(CASE WHEN time_slot_4 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_4,SUM(CASE WHEN time_slot_4 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_4,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_4 FROM room;";
    con.query(sql, function (err, results){
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else {
            res.send(results);
        }
    })
});
// GET history info
app.get("/dashboard/gethistory", function(_req, res){
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'approved';";
    con.query(sql, function (err, results){
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else {
            res.send(results);
        }
    })
});


// ===== confirm =====
// Confirm service
app.get('/confirm', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/confirm.html'));
});
// GET confirm info
app.get("/confirm/getconfirm", function(_req, res){
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'pending';";
    con.query(sql, function (err, results){
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else {
            res.send(results);
        }
    })
});
// Update booking status service
app.post('/confirm/update_booking_status', function (req,res) {
    const {booking_id,whoApprove,status} = req.body;
    // const  booking_id = req.params.id;
    // const status = req.params.status;
    // UPDATE `booking` SET `status` = 'approved' WHERE `booking`.`booking_id` = 1
    const sql = `UPDATE booking SET status = ?, whoApprove = ? WHERE booking.booking_id = ?`;
    con.query(sql,[status,whoApprove,booking_id] ,function (err,results) {
        if(err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send("update success")
        }
    
    })
});
app.get('/room', (req, res) => {
    // ดึงข้อมูลห้องจากฐานข้อมูล
    con.query('SELECT * FROM room', (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
      } else {
        res.json(results);
      }
    });
  });


// Root service
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Login.html'));
});
// Register service
app.get('/sign-up', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Sign_up.html'));
});

const port = 3000;
app.listen(port, function () {
    console.log('Server is ready at' + port);
});
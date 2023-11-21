const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const { ok } = require('assert');
const upload = require('./config/upload');
const { stringify } = require('querystring');

const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
//for JS exchange
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
let userid = '';
let userrole = '';
let name = '';


// ---------- for session -----------
// set up
app.use(session({
    cookie: { maxAge: 24 * 60 * 60 * 100 },
    secret: 'mysecretcode',
    resave: false,
    saveUninitialized: true
}));
// Get user info
app.get('/user', function (req, res) {
    res.json({ 'user_id': req.session.user_id, 'username': req.session.username, 'role': req.session.role, 'name':req.session.name, 'phone':req.session.phone});
});


// ------------- Logout --------------
app.get("/logout", function (req, res) {
    // clear session
    req.session.destroy(function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Cannot logout');
        }
        else {
            userid = '';
            userrole = '';
            res.redirect('/');
        }
    });

});
// ---------- login -----------
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = 'SELECT user_id, email, password, name, role, phone FROM user WHERE email=?';
    con.query(sql, [username], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else if (results.length != 1) {
            res.status(401).send('Username not found');
        }
        else {
            bcrypt.compare(password, results[0].password, function (err, same) {
                if (err) {
                    res.status(500).send('Password compare error');
                }
                else {
                    if (same) {
                        req.session.user_id = results[0].user_id;
                        req.session.username = username;
                        req.session.role = results[0].role;
                        req.session.name = results[0].name;
                        req.session.phone = results[0].phone
                        console.log(req.session.user_id);
                        console.log(req.session.role);
                        userid = results[0].user_id;
                        userrole = req.session.role;
                        name = req.session.name;
                        // If you want to foward the user to the next page put it here
                        // Student
                        if (results[0].role == 1) {
                            res.send('/home');
                        }
                        // Staff
                        else if (results[0].role == 2) {
                            res.send('/staff/home');
                        }
                        // Lecturer
                        else if (results[0].role == 3) {
                            res.send('/dashboard');
                        }
                    }
                    else {
                        res.status(401).send('wrong password');
                    }

                }
            })
        }
    })
});
// ================================== RESET time_slots ==================================
con.connect(err => {
    if (err) {
      console.error('error connecting to database:', err);
      return;
    }
  
    console.log('connected to database');
  
    const checkTime = () => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
  
      if (hours === 0 && minutes === 0) {
        con.query(`UPDATE room SET time_slot_1=0, time_slot_2=0, time_slot_3=0, time_slot_4=0`, err => {
          if (err) {
            console.error('error updating room:', err);
            return;
          }
  
          console.log('room updated successfully');
        });
        con.query(`UPDATE booking SET status='rejected' where status='pending'`, err => {
          if (err) {
            console.error('error updating room:', err);
            return;
          }
  
          console.log('booking updated successfully');
        });

      }
    };
  
    setInterval(checkTime, 60000); // Check the time every minute
  });

// ================================== ACCOUNT ===========================================
app.get('/account', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/account.html'));
});
// ================================== RESET PASSWORD PAGE====================================
app.get('/account/change_password', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/change_password.html'));
});
//  ================================== RESET PASSWORD ====================================
app.post('/account/change_password/reset', function (req, res) {
    const {old_password, new_password} = req.body;
    const find_old_password = `SELECT password FROM user WHERE user_id = ?`;
    con.query(find_old_password, [req.session.user_id], function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error insert data!");
        }
        else if (result.length != 1) {
            res.status(401).send('Password not found!');
        }
        else {
            bcrypt.compare(old_password, result[0].password, function (err, same) {
                if (err) {
                    res.status(500).send('Password compare error');
                }
                else {
                    // Old password match
                    if (same) {
                        bcrypt.hash(new_password, 10, function (err, hash) {
                            console.log(hash);
                            if (err) {
                                return res.status(500).send("Hash error!");
                            }
                            const sql = `UPDATE user SET password = ? WHERE user_id = ?`;
                            con.query(sql, [hash, userid], function (err, results) {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send("Reset password error!");
                                }
                                else {
                                    res.send("Reset password success!")
                                }

                            })

                        })
                    }
                    else {
                        res.status(401).send('wrong password');
                    }

                }
            })
        }

    })
});
app.get('/home', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/project/Page1.html'));
    }
    else if (req.session.role == 2){
        res.redirect('/staff/home');
    }
    else if (req.session.role == 3){
        res.sendFile(path.join(__dirname, 'views/project/Page1.html'));
    }
    else{
        res.redirect('/');
    }

});
app.get('/staff/home', function (req, res) {
    if (req.session.role == 2) {
        res.sendFile(path.join(__dirname, 'views/project/Page2.html'));
    }
    else if (req.session.role == 3){
        res.redirect('/confirm');
    }
    else if (req.session.role == 1){
        res.redirect('/home');
    }
    else{
        res.redirect('/');
    }
});
app.post('/staff/home/disableroom', function (req, res) {
    const { room_id } = req.body;
    const sql = `UPDATE room SET status = 'disabled' WHERE room_id = ?`;
    con.query(sql, [room_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error disable room");
        }
        else {
            res.send("Disable room success")
        }

    })
});
app.post('/staff/home/enableroom', function (req, res) {
    const { room_id } = req.body;
    const sql = `UPDATE room SET status = 'available' WHERE room_id = ?`;
    con.query(sql, [room_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error enable room");
        }
        else {
            res.send("Enable room success")
        }

    })
});

// ---------- Page routes -----------
app.get('/account/my-booking', function (req, res) {
    if (req.session.role != 1) {
        res.sendFile(path.join(__dirname, 'views/project/My_Booking_not_student.html'));
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/My_Booking.html'));
    }
});






app.get('/dashboard', function (req, res) {
    // There was an error here I changed != to ==
    if (req.session.role == 1) {
        res.redirect('/');
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/dashboard.html'));
    }
});

// root service
app.get('/', function (req, res) {
    if (req.session.role == 1) {
        res.redirect('/home');
    }
    else if (req.session.role == 2) {
        res.redirect('/staff/home');
    }
    else if (req.session.role == 3){
        res.redirect('/confirm');
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/Login.html'));
    }
});

// ---------- Register -----------

app.post('/register', function (req, res) {
    const { user_id, email, password, name, phone } = req.body;
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


// ===== get addroom =====
app.get('/addroom', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/project/addroom.html'));
});

// ------------- Insert new room into database --------------
app.post("/addroom/insert_room", function (req, res) {
    const {room_name, building, capacity, audio, video, plug, speakerphone, TV, webcam} = req.body;
    // const image = req.body.room_name;
    const sql = "INSERT INTO room (room_name, status, time_slot_1, time_slot_2, time_slot_3, time_slot_4, audio, video, plug, speakerphone, TV, webcam, image, building, capacity) VALUES(?,'available',0,0,0,0,?,?,?,?,?,?,'OIP.jpg',?,?)";
    con.query(sql, [room_name, audio, video, plug, speakerphone, TV, webcam, building, capacity], async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }                    
        else {
            console.log('Pass check point 2!');
            res.status(200).send("Add successfully");
            }
        
    });
});

// ---------- My Booking -----------
app.get('/my-booking/getbooking', function (_req, res) {
    if (userrole != 1) {
      res.status(403).json({ error: 'Unauthorized' });
    } else {
      const userId = userid;
      const query = `SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.user_id = ? ORDER BY booking_id DESC;`;
  
      con.query(query, [userId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(results);
        }
      });
    }
  });
//---------------------------------------------------------------------

// ===== Dasboard =====
// Dashboard service
app.get('/staff/home/dashboard', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/dashboard.html'));
});
// Datetime service
app.get("/now", function (_req, res) {
    const dt = new Date().toLocaleString();
    res.send(dt);
});
// GET dashboard info
app.get('/dashboard/getdashboard', function (_req, res) {
    const sql = "SELECT SUM(CASE WHEN time_slot_1 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_1,SUM(CASE WHEN time_slot_1 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_1,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_1,SUM(CASE WHEN time_slot_2 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_2,SUM(CASE WHEN time_slot_2 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_2,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_2,SUM(CASE WHEN time_slot_3 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_3,SUM(CASE WHEN time_slot_3 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_3,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_3,SUM(CASE WHEN time_slot_4 = 0 AND status <> 'disabled' THEN 1 ELSE 0 END) AS free_rooms_time_slot_4,SUM(CASE WHEN time_slot_4 = 1 AND status <> 'disabled' THEN 1 ELSE 0 END) AS reserved_rooms_time_slot_4,SUM(CASE WHEN status = 'disabled' THEN 1 ELSE 0 END) AS disabled_rooms_time_slot_4 FROM room;";
    con.query(sql, function (err, results) {
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
app.get("/dashboard/gethistory", function (_req, res) {
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'approved' ORDER BY booking_id DESC;";
    con.query(sql, function (err, results) {
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
    if (req.session.role == 1) {
        res.redirect('/home');
    }
    else if (req.session.role == 2) {
        res.redirect('/staff/home');
    }
    else if (req.session.role == 3){
        res.sendFile(path.join(__dirname, 'views/project/confirm.html'));
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/Login.html'));
    }
});
// GET confirm info
app.get("/confirm/getconfirm", function (_req, res) {
    const sql = "SELECT booking.*, room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'pending' ORDER BY booking_id DESC;";
    con.query(sql, function (err, results) {
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
app.post('/confirm/update_booking_status', function (req, res) {
    const { booking_id, status } = req.body;
    const sql = `UPDATE booking SET status = ?, whoApprove = ? WHERE booking.booking_id = ?`;
    con.query(sql, [status, req.session.name, booking_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send(results)
        }

    })
});
// Update room time_slot
app.post('/confirm/update_room_time_slot', function (req, res) {
    const { room_id, time_slot } = req.body;
    const sql = `UPDATE room SET ${time_slot} = 0 WHERE room.room_id = ?`;
    con.query(sql, [room_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send(results)
        }

    })
});

// API endpoint สำหรับการดึงข้อมูลห้อง

app.get('/room', (_req, res) => {
    // ดึงข้อมูลห้องจากฐานข้อมูล
    con.query('SELECT * FROM room', (err, results) => {
        if (err) {
            console.error('QUERY error', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });

});
// for searching room by name
app.post('/room', (req, res) => {
    const room_name = req.body.room_name; // Assuming room_name is in the request body
    const sql = "SELECT * FROM room WHERE TRIM(room_name) LIKE ?;";
    con.query(sql, [`%${room_name}%`], (err, results) => {
        if (err) {
            console.error('QUERY error', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});
// for searching room by ID
app.post('/get_room_by_id', (req, res) => {
    const room_id = req.body.room_id; // Assuming room_name is in the request body
    const sql = "SELECT * FROM room WHERE room_id = ?;";
    con.query(sql, [room_id], (err, results) => {
        if (err) {
            console.error('QUERY error', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});


app.post('/update_room_status', function (req, res) {
    const { room_id, status } = req.body;
    const sql = `UPDATE room SET status = ? WHERE room_id = ?`;
    con.query(sql, [status, room_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send("update success")
        }
    })
});

app.get('/booking_details', function (req, res) {
    if (req.session.role == 1) {
        res.sendFile(path.join(__dirname, 'views/project/Booking_details.html'));
    }
    else if (req.session.role == 2) {
        // res.redirect('/staff/home');
        res.sendFile(path.join(__dirname, 'views/project/Booking_details.html'));
    }
    else if (req.session.role == 3){
        // res.redirect('/confirm');
        res.sendFile(path.join(__dirname, 'views/project/Booking_details.html'));
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/Login.html'));
    }
    // res.sendFile(path.join(__dirname, 'views/project/Booking_details.html'));
});

// Array to store booked times
app.post('/booking_details/add_booking', function (req, res) {
    const {room_id,selectedTime,agenda,username} = req.body;
    let time_slot_1=0, time_slot_2=0, time_slot_3=0, time_slot_4=0;
    console.log(selectedTime);
    if(selectedTime == 'time_slot_1'){time_slot_1 = 1;}
    else if(selectedTime == 'time_slot_2'){time_slot_2 = 1;}
    else if(selectedTime == 'time_slot_3'){time_slot_3 = 1;}
    else if(selectedTime == 'time_slot_4'){time_slot_4 = 1;}
    else{}
    // get datetime info
    const currentDate = new Date();
    date = currentDate.toLocaleString('sv');
    // const image = req.body.room_name;
    const sql = "INSERT INTO booking (user_id, room_id, date, time_slot_1, time_slot_2, time_slot_3, time_slot_4, status, agenda, whoApprove, whoBook) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
    con.query(sql, [req.session.user_id,room_id,date,time_slot_1,time_slot_2,time_slot_3,time_slot_4,'pending',agenda,'',req.session.name], async function (err) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }                    
        else {
            // console.log('Pass check point 2!');
            res.status(200).send("Add successfully");
            }
        
    });
});
app.post('/booking_details/update_time_slot', function(req, res){
    const {room_id, selectedTime} = req.body;
    // update the room according to the booking
    const sql = `UPDATE room SET ${selectedTime} = 1 WHERE room_id = ?`;
    con.query(sql, [room_id], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows !== 1) {
            console.error('Row updated is not 1');
            return res.status(500).send("Update failed");
        }
        res.send("Update successfully");
    });
});



// EDIT ROOM
app.get('/editroom', async function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/editroom.html'));
});

app.post('/editroom/get/', function (req, res) {
    const room_id = req.body.room_id; // Assuming room_name is in the request body
    const sql = "SELECT * FROM room WHERE room_id = ?;";
    con.query(sql, [`%${room_id}%`], (err, results) => {
        if (err) {
            console.error('QUERY error', err);
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.json(results);
        }
    });
});
// Update Room
app.put("/editroom/update/:id", function (req, res) {
    const id = req.params.id;
    const updateRoom = req.body;
    const sql = "UPDATE room SET ? WHERE room_id = ?";

    con.query(sql, [updateRoom, id], function (err, results) {
        if (err) {
            console.error(err);
            return res.status(500).send("Database server error");
        }
        if (results.affectedRows !== 1) {
            console.error('Row updated is not 1');
            return res.status(500).send("Update failed");
        }
        res.send("Update successfully");
    });
});

// Root service
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Login.html'));
});
// Register service
app.get('/sign-up', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Sign_up.html'));
});


const port = 3000;
app.listen(port, function () {
    console.log("Server is ready at " + port);
});

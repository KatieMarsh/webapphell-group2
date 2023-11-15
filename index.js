const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const { ok } = require('assert');


const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
//for JS exchange
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/home', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Page1.html'));

});
app.get('/staff/home', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Page2.html'));
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
    const sql = `UPDATE room SET status = 'enabled' WHERE room_id = ?`;
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
    res.json({ 'userID': req.session.userID, 'username': req.session.username, 'role': req.session.role });
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
            res.redirect('/');
        }
    });

});

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
                        req.session.user_ID = results[0].user_id;
                        req.session.username = username;
                        req.session.role = results[0].role;

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



// ---------- Page routes -----------
app.get('/my-booking', function (req, res) {
    if (req.session.role != 1) {
        res.redirect('/');
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/My_Booking.html'));
    }
});



app.post('/my-booking/getbooking', function (req, res) {
    if (req.session.role !== 1) {
      res.status(403).json({ error: 'Unauthorized' });
    } else {
      const userId = req.session.userId;
      const query = `
        SELECT date, room_id, time_slot_1, time_slot_2, time_slot_3, time_slot_4, status
        FROM booking
        WHERE user_id = ?`;
  
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          res.json({ bookings: results });
        }
      });
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
        res.redirect('/my-booking');
    }
    else if (req.session.role == 2) {
        res.redirect('/dashboard');
    }
    else {
        res.sendFile(path.join(__dirname, 'views/project/Login.html'));
    }
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
app.get("/my-booking/getbooking", function (_req, res) {
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.user_id = 'sss';";
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        } else {
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
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'approved';";
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
    res.sendFile(path.join(__dirname, 'views/project/confirm.html'));
});
// GET confirm info
app.get("/confirm/getconfirm", function (_req, res) {
    const sql = "SELECT booking.*,room.room_name, DATE_FORMAT(booking.date, '%Y-%m-%d') AS formatted_date FROM booking JOIN room ON booking.room_id = room.room_id  WHERE booking.status = 'pending';";
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
    const { booking_id, whoApprove, status } = req.body;
    // const  booking_id = req.params.id;
    // const status = req.params.status;
    // UPDATE `booking` SET `status` = 'approved' WHERE `booking`.`booking_id` = 1
    const sql = `UPDATE booking SET status = ?, whoApprove = ? WHERE booking.booking_id = ?`;
    con.query(sql, [status, whoApprove, booking_id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.send("update success")
        }

    })
});

// API endpoint สำหรับการดึงข้อมูลห้อง

app.get('/room', (_req, res) => {
 // ดึงข้อมูลห้องจากฐานข้อมูล
 con.query('SELECT * FROM room', (err, results) => {
   if (err) {
     console.error('QUERY error',err);
     res.status(500).json({ success: false, message: 'Internal Server Error' });
   } else {
     res.json(results);
   }
 });

});
// for searching room
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




app.post('/update_room_status', function (req,res) {
   const {room_id,status} = req.body;
   const sql = `UPDATE room SET status = ? WHERE room_id = ?`;
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

// ------------- Add a new room --------------
app.post("/rooms", function (req, res) {

    const newRoom = req.body;
    const sql = "INSERT INTO room SET ?";
    con.query(sql, newRoom, function (err, results) {
      if (err) {
        console.error(err);
        return res.status(500).send("Database server error");
      }
      if (results.affectedRows !== 1) {
        console.error('Row added is not 1');
        return res.status(500).send("Add failed");
      }
      res.status(200).send("Add successfully");
    });
  });
  
  // ------------- Update a room --------------


// Update Room
app.put("/rooms/:id", function (req, res) {
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



app.get('/addroom', function (req, res) {

    res.sendFile(path.join(__dirname, 'views/project/addroom.html'));

    app.put("/rooms/:id", function (req, res) {
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
            res.status(200).send("Update successfully");
        });
    });

});



app.get('/addroom', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/addroom.html'));
});
app.get('/account', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/account.html'));
});

app.get('/booking_details', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Booking_details.html'));
});


app.get('/editroom', function (_req, res) {
    res.sendFile(path.join(__dirname, 'views/project/editroom.html'));
});

 app.get('/editroom/:room_id', function (req, res) {
    const {room_id} = req.params.room_id;
    const sql = `GET * from room WHERE room_id = ?`;
    con.query(sql,[room_id] ,function (err,results) {
        if(err) {
            console.error(err);
            res.status(500).send("Server error update data!");
        }
        else {
            res.render('project/editroom', { room: roomData });
        }
    })
    res.sendFile(path.join(__dirname, 'views/project/editroom.html'));
});
// Root service
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Login.html'));
});
// Register service
app.get('/sign-up', function (req, res) {

    res.sendFile(path.join(__dirname, 'views/project/Sign_up.html'));
});

app.get('/my-booking', function (req, res) {

    res.sendFile(path.join(__dirname, 'views/project/My_Booking.html)'));
});


const port = 3000;
app.listen(port, function () {
    console.log("Server is ready at " + port);
});
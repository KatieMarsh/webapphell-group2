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
  
  
  app.get('/rooms', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/addroom.html'));
});

app.get('/accout', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/accout.html'));
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




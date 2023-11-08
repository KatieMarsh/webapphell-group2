const express = require('express');
const path = require('path');
const con = require('./config/db');
const bcrypt = require('bcrypt');

const app = express();
app.use("/public", express.static(path.join(__dirname, "public")));
//for JS exchange
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Register
app.post('/sign-up', function (req,res) {
    const {email,password,conpassword,name,phone} = req.body;
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
                    const sql = `INSERT INTO user (email, password, name, phone, role) VALUES(?,?,?,?,1)`;
                    con.query(sql,[email,hash,name,phone,] ,function (err,results) {
                        if(err) {
                            console.error(err);
                            res.status(500).send("Server error insert data!");
                        }
                        else {
                            res.send("kuy sun and bank")
                        }
                    
                    })
                }
            })
        }) 
});


// Root service
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'views/project/Sign_up.html'));
});

const port = 3000;
app.listen(port, function () {
    console.log('Server is ready at' + port);
});
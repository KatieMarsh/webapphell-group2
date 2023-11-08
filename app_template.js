const express = require('express');
const path = require('path');
const bcrypt = require("bcrypt");
const con = require('./config/db');
const session = require('express-session');
const memorystore = require('memorystore')(session);
const app = express();

// set the public folder
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// setup the session
app.use(session({
    // total time for server to remember in milisecond
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    secret: 'IamSoSleepyAndINeedCoffee',
    resave: false,
    saveUninitialized: true,
    store: new memorystore({
        checkPeriod: 24 * 60 * 60 * 1000
    })
}));

// ------------- Get user info --------------
app.get("/user", function (req, res) {
    // res.send(req.session.username);
    res.json({ "username": req.session.username, "userID": req.session.userID });
});

// ------------- Edit a product --------------
app.put("/products/:id", function (req, res) {

});

// ------------- Add a new product --------------
app.post("/products", function (req, res) {

});

// ------------- DELETE a product --------------
app.delete("/products/:id", function (req, res) {
    const sql = 'DELETE FROM product WHERE id=?';
    con.query(sql, [req.params.id], function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else if (results.affectedRows != 1) {
            res.status(500).send('Delete failed');
        }
        else {
            res.send('Delete complete');
        }

    })
});

// ------------- GET all products --------------
app.get("/products", function (_req, res) {
    const sql = 'SELECT * FROM product';
    con.query(sql, function (err, results) {
        if (err) {
            console.error(err);
            res.status(500).send('DB error');
        }
        else {
            res.json(results);
        }

    })
});

// ---------- password generator -----------
app.get('/password/:pass', function (req, res) {
    bcrypt.hash(req.params.pass, 10, function (err, hash) {
        if (err) {
            console.error(err);
            res.status(500).send('Hashing error');
        }
        else {
            res.send(hash);
        }
    })
});

// ---------- login -----------
app.post('/login', function (req, res) {
    const { username, password } = req.body;
    const sql = 'SELECT id, username, password, role FROM user WHERE username=?';
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
                        // res.send('Login successfully');
                        // If you want to foward the user to the next page put it here
                        req.session.username = username;
                        req.session.userID = results[0].id;
                        req.session.role = results[0].role;
                        if(results[0].role == 1){
                            res.send('/welcome');
                        }
                        else if (results[0].role == 2){
                            res.send('/shop')
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

// ------------- Logout --------------
app.get("/logout", function (req, res) {
    // clear session
    req.session.destroy(function(err) {
        if(err) {
            console.error(err.message);
            res.status(500).send('Cannot logout');
        }
        else {
            res.redirect('/');
        }
    });

});
// ------------ product page ----------

// ============  Client page =================
app.get('/shop', function (req, res) {
    if(req.session.username && req.session.role == 2){
        res.sendFile(path.join(__dirname, 'views/week10/shop.html'));
    }
    else {
        res.redirect('/');
    }
    
});

// ============  Admin page =================
app.get('/welcome', function (req, res) {
    if(req.session.username){
        res.sendFile(path.join(__dirname, 'views/week9/welcome_template_delete.html'));
    }
    else {
        res.redirect('/');
    }
    
});

// ------------ root service ----------
app.get('/', function (req, res) {
    if (req.session.username && req.session.role == 1) {
        res.redirect('/welcome');
    }
    else if(req.session.role == 2) {
        res.redirect('/shop');
    }
    else {
        res.sendFile(path.join(__dirname, 'views/week9/login_template.html'));
    }

});

const PORT = 3000;
app.listen(PORT, function () {
    console.log('Server is running at port ' + PORT);
});
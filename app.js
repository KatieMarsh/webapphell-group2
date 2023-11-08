const { log } = require('console');
const express = require('express');
const app = express();
const path = require('path');
const con = require('./config/db');

// set the public folder
app.use('/public', express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const books = [
    {"title":"aaa","price":999},
    {"title":"bbb","price":399},
    {"title":"ccc","price":199}
];

// Web services, web API, routes
// get all books
app.get('/book',function(req,res){
    res.json(books);
});

// Login, GET
app.get('/login/:username/:password',function(req,res){
    // http://localhost:3000/login/admin/1234
    // const username = req.params.username;
    // const password = req.params.password;
    
    const {username, password} = req.params;
    // console.log(username, password);
    // res.end();
    
    if(username == 'admin' && password == '1234'){
        res.status(200).send('Login success');
    }
    else{
        res.status(401).send('Login failed');
    }
});

// Login, POST
app.post('/login',function(req, res){
    // const username = req.body.username;
    // const password = req.body.password;
    // console.log(username, password);
    // res.end();
    const {username, password} = req.body;
    const sql = "SELECT id,username,role FROM user WHERE username=? AND password=?";
    // const sql = "SELECT id,username,role FROM user WHERE username='admin' AND password='1234'";
    // const sql = "SELECT id,username,role FROM user WHERE username=" +username+ " AND password="+password;
    con.query(sql, [username, password],function(err, results){
        if(err) {
            console.log(err);
            res.status(500).send('DB error');
        }
        else if(results.length != 1){
            // 401 is "unauthorized"
            res.status(401).send('Username or password is wrong');
        }
        else {
            res.send('Login successfully');
        }
    })
    // if(username == 'admin' && password == '1234'){
    //     res.status(200).send('Login success');
    // }
    // else{
    //     res.status(401).send('Login failed');
    // }
});


// service return the current server's time
app.get('/now',function(_req,res){
    res.send(new Date().toLocaleString());
});

// root service
app.get('/',function(_req, res){
    // res.status(200).send('Welcome to backend');
    // res.send('Welcome to backend');
    // res.sendFile(__dirname+'/views/week8/index.html'); // Not the best way :(
    res.sendFile(path.join(__dirname,'views/week9/login_template.html'));
});



const PORT = 3000;
app.listen(PORT, function(){
    console.log('Server is running at port '+PORT);
});
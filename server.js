const express = require("express");
var fs = require("fs");
const jsonParser = require("body-parser").json();

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
    next();
});

app.get('/', (req, res) => res.send("Hello"));
app.get('/*', (req, res) => {
    fs.readFile(__dirname + req.url, { encoding: 'utf-8', flag: 'r' },
        function (error, data) {
            if (!error) {
                res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
                res.end(data);
            } else {
                res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify(error));
            }
        });
});

app.post('/signin', jsonParser, (req, res) => {
    if (req.body.username == "dinh" && req.body.password == "1234")
        res.send({ status: "ok", message: "login thanh cong!" });
    else
        res.send({ status: "nok", message: "login that bai!" });
});
var mangUsers = [];
app.post('/signup', jsonParser, (req, res) => {
    var username1 = req.body.username;
    var password1 = req.body.password;
    var index = mangUsers.findIndex(e => e.username == username1 && e.password == password1);
    if (index == -1) {
        var user = { username: username1, password: password1 };
        mangUsers.push(user);
        res.send({ status: "ok", message: "dang ky thanh cong!" });
    } else
        res.send({ status: "nok", message: "dang ky that bai!" });
});
app.post('/login', jsonParser, (req, res) => {
    var username1 = req.body.username;
    var password1 = req.body.password;
    var index = mangUsers.findIndex(e => e.username == username1 && e.password == password1);
    if (index >=0) {
        res.send({ status: "ok", message: "dang nhap thanh cong!" });
    } else
        res.send({ status: "nok", message: "dang nhap that bai!" });
})

app.listen(process.env.PORT || 3000, () => console.log("Server is running!"));
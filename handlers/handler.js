"use strict"

class Handler {

    async getTest(req, res) {
        console.log(req.token);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: "ok", message: "login thanh cong!" }));

    }

    async postTest(req, res) {
        let dataJson = req.json_data;
        console.log(dataJson);
        res.writeHead(403, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: "Lỗi", message: "error update db" }));
    }

}

module.exports = new Handler()
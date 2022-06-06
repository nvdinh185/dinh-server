// Include http ,url module.
var http = require('http');
var fs = require('fs');
var url = require('url');

// Create http server.
var httpServer = http.createServer(function (req, res) {

    // Get client request url.
    var reqUrlString = req.url;
    
    // Get client request path name.
    var pathName = url.parse(reqUrlString, true, false).pathname;
    
    // If request login action.
    // if ('/login' == pathName) {
        // Get request method.
        var method = req.method;

        // If post.
        if ("POST" == method) {
            var postData = '';

            // Get all post data when receive data event.
            req.on('data', function (chunk) {
                postData += chunk;
            });

            // When all request post data has been received.
            req.on('end', function () {

                // console.log("Client post data : " + postData);

                // Parse the post data and get client sent username and password.
                var postDataObject = JSON.parse(postData);

                var username = postDataObject.username;

                var password = postDataObject.password;

                /* Set Access-Control-Allow-Origin http header will fix No 'Access-Control-Allow-Origin' header is present on the requested resource error
                   when use XMLHttpRequest object to get this server page via ajax method. */
                res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });

                if ('user1' == username && '123' == password) {
                    res.end('{status: "ok", message: "ban da login thanh cong!"}');
                } else {
                    res.end('{status: "nok", message: "khong thanh cong"}');
                }
            })
        } else if ("GET" == method) {
            // get
            var reqUrlString = req.url;
            var urlObject = url.parse(reqUrlString, true, false);

            // Get user request file name.
            var fileName = urlObject.pathname;
            fileName = fileName.substr(1);

            // Read the file content and return to client when read complete.
            fs.readFile(fileName, { encoding: 'utf-8', flag: 'r' }, function (error, data) {

                if (!error) {
                    res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
                    res.end(data);
                } else {
                    res.writeHead(404, { 'Access-Control-Allow-Origin': '*' });
                    res.end(JSON.stringify(error));
                }
            });
        }
    // }
});

httpServer.listen(process.env.PORT || 4000, () => console.log("Server is started on port 4000..."));
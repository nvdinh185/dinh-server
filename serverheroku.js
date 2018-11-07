// Include http ,fs and url module.
var http = require('http');
var fs = require('fs');
var url = require('url');

// Create http server.
var httpServer = http.createServer(function (req, resp) {

    // Get an parse client request url.
    var reqUrlString = req.url;
    var urlObject = url.parse(reqUrlString, true, false);

    // Get user request file name.
    var fileName = urlObject.pathname;
    fileName = fileName.substr(1);

    // Read the file content and return to client when read complete.
    fs.readFile(fileName, {encoding:'utf-8', flag:'r'}, function (error, data) {
        
        if(!error)
        {
            /* Set Access-Control-Allow-Origin http header will fix No 'Access-Control-Allow-Origin' header is present on the requested resource error
               when use XMLHttpRequest object to get this server page via ajax method. */
            resp.writeHead(200, {'Access-Control-Allow-Origin':'*'});
            resp.end(data);
        }else
        {
            resp.writeHead(404, {'Access-Control-Allow-Origin':'*'});
            resp.end(JSON.stringify(error));
        }
    });
});

// Http server listen on port 8888.
httpServer.listen(8888);

console.log("Access this example with url 'http://localhost:8888/abc.js' to get js file source code.");



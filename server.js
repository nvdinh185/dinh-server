const express = require('express');
const app = express();

function main(isHttp) {
    app.use('/route', require('./routes/route'));

    if (isHttp) {
        const httpServer = require('http').createServer(app);
        const portHttp = isHttp;
        httpServer.listen(portHttp, () => {
            console.log("Server HTTP is started with PORT: "
                + portHttp);
        });
    }
}

const port = process.env.PORT || 8000;

main(port);
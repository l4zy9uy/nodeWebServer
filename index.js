const net = require('net');
require('url');
const fs = require('fs');
const port = 7070;
const host = '127.0.0.1';

const server = net.createServer();

server.listen(port, host, () => {
    console.log(`TCP server listening on ${host}:${port}`);
});

server.on('connection', (sock) => {
    console.log(`Socket is connected by ${sock.remoteAddress}:${sock.remotePort}`);
    sock.on('data', (data) => {
        const request = data.toString()
        const requestLine = request.split('\r\n')[0];
        const [method, requestUrl] = requestLine.split(' ');
        console.log(`${request}\n${requestLine}\n${method}\n${requestUrl}`);

        if(method === 'GET') {
            const filename = requestUrl.substring(1);
            console.log(`${filename}`);
            const stream = fs.createReadStream(filename);
            stream.on('open', () => {
                sock.write('HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n');
                stream.pipe(sock);
            });
            stream.on('error', () => {
                sock.write('HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found');
                sock.end();
            });
        }
    });

    sock.on('error', (err) => {
        console.error(`Socket error: ${err.message}`);
    });

    sock.on('close', () => {
        console.log('Socket closed');
    });
});
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});



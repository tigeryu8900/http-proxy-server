import net from "net";

const server = net.createServer();
const port = process.env.PORT || 5000;

server.on("connection", c2pSocket => {
    console.log("Client Connected To Proxy");
    c2pSocket.once("data", data => {
        const dataStr = data.toString();
        console.log(dataStr);
        const isTLSConnection = dataStr.includes("CONNECT");

        const p2sSocket = net.createConnection({
            port: isTLSConnection ? 443 : 80,
            ...dataStr.match(/(?<=Host:\s*)(?<host>[^\s:]+)(?::(?<port>\d+))?/).groups
        }, () => {
            console.log("PROXY TO SERVER SET UP");

            if (isTLSConnection) {
                c2pSocket.write("HTTP/1.1 200 OK\r\n\n");
            } else {
                p2sSocket.write(data);
            }

            c2pSocket.pipe(p2sSocket);
            p2sSocket.pipe(c2pSocket);

            p2sSocket.on("error", err => {
                console.log("PROXY TO SERVER ERROR");
                console.log(err);
            });
        });

        c2pSocket.on("error", err => {
            console.log("CLIENT TO PROXY ERROR");
            console.log(err);
        });
    });
});

server.on("error", err => {
    console.log("SERVER ERROR");
    console.log(err);
});

server.on("close", () => {
    console.log("Client Disconnected");
});

server.listen(port, () => {
    console.log('Server running at http://localhost:' + port);
});

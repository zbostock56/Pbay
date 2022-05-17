const admin = require("firebase-admin");
const { applicationDefault } = require("firebase-admin/app");
const { getAuth, getUser } = require("firebase-admin/auth");

admin.initializeApp({
    credential: applicationDefault(),
});

const express = require("express");
const helmet = require("helmet");
const busboy = require("connect-busboy");
const ejs = require("ejs");

const { source, db } = require("./src/app");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(busboy({ immediate: true }));

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(helmet.contentSecurityPolicy({
    directives: {
        "script-src": [
            "self",
            "http://localhost:3000/client.js",
            "http://localhost:3000/footer.js",
            "http://localhost:3000/socket.io/socket.io.js",
            "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js",
            "https://pbay-51219.firebaseapp.com/",
            "https://unpkg.com/axios/dist/axios.min.js",
            "https://*.gstatic.com",
            "https://*.googleapis.com",
            "https://*.google.com",
        ],
        "connect-src": [
            "self",
            "http://localhost:3000",
            "ws://localhost:3000/socket.io/",
            "https://*.googleapis.com",
            "https://*.google.com",
            "https://*.gstatic.com"
        ],
        "frame-src": [
            "http://127.0.0.1:9099",
            "https://pbay-51219.firebaseapp.com/"
        ]
    }
}));

app.use('/', source);

const connected_users = [];

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("validate", (idToken) => {
        const auth = getAuth();
        auth.verifyIdToken(idToken)
        .then((decodedToken) => {
            console.log("User validated");
            connected_users.push(decodedToken.uid);
            console.log(`Validated Users: ${connected_users}`);

            socket.on('disconnect', () => {
                console.log("Validated user disconnected");
                connected_users.splice(connected_users.indexOf(decodedToken.uid), 1);
                console.log(`Validated Users: ${connected_users}`);
            });

            socket.on('message', (target, msg) => {
                if (connected_users.includes(target)) {
                    io.emit("message", { target: target, msg: msg, time: new Date().getTime() });
                } else {
                    const target = admin.auth().getUser(target)
                    .then(async () => {
                        const messages = db.collection("messages");
                        await messages.insertOne({
                            target: target,
                            from: decodedToken.uid,
                            msg: msg,
                            time: new Date().getTime()
                        });
                    })
                    .catch(() => {
                        console.log("Invalid target");
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            socket.disconnect(true);
        });
    });
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});

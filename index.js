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

const { source } = require("./src/app");
const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const PORT = 3000;

const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);
let db;

client.connect().then(() => {
    db = client.db("Pbay");
    console.log(`Connected to database at: ${url}`);
}).catch((err) => {
    console.log(err);
});

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
            "http://localhost:9099",
            "ws://localhost:3000/socket.io/",
            "https://*.googleapis.com",
            "https://*.google.com",
            "https://*.gstatic.com"
        ],
        "frame-src": [
            "http://localhost:9099",
            "http://127.0.0.1:9099",
            "https://pbay-51219.firebaseapp.com/"
        ]
    }
}));

app.use('/', source);

const connected_users = [];

io.on("connection", (socket) => {
    console.log("User connected");

    socket.on("validate", (args) => {
        const auth = getAuth();
        auth.verifyIdToken(args.idToken)
        .then((decodedToken) => {
            console.log("User validated");
            connected_users.push(`${decodedToken.uid}+${args.target}`);
            console.log(`Validated Users: ${connected_users}`);

            socket.on('disconnect', () => {
                console.log("Validated user disconnected");
                connected_users.splice(connected_users.indexOf(`${decodedToken.uid}+${args.target}`), 1);
                console.log(`Validated Users: ${connected_users}`);
            });

            socket.on('message', async (target, msg) => {
                admin.auth().getUser(target)
                .then(async (t_record) => {
                    const conversations = db.collection("conversations");

                    // Check if conversation exists for both parties
                    const convo_user = await conversations.findOne({
                        owner: decodedToken.uid,
                        target: target
                    });

                    const convo_target = await conversations.findOne({
                        owner: target,
                        target: decodedToken.uid
                    });

                    // Create conversations for both parties if non existent
                    if (!convo_user) {
                        await conversations.insertOne({
                            owner: decodedToken.uid,
                            target: target,
                            target_name: t_record.displayName,
                            messages: [],
                            unread: false
                        });
                    }

                    if (!convo_target) {
                        await conversations.insertOne({
                            owner: target,
                            target: decodedToken.uid,
                            target_name: decodedToken.name,
                            messages: [],
                            unread: false
                        })
                    }

                    // Set convo of user to read                
                    await conversations.updateOne({
                        owner: decodedToken.uid,
                        target: target
                    }, { $set: { unread: false }});

                    // Send message
                    if (msg.length > 80) {
                        io.emit("error", { msg: "Message cannot exceed 80 characters!" });
                    } else if (connected_users.includes(`${target}+${decodedToken.uid}`)) {
                        io.emit("message", { target: target, from: decodedToken.uid, from_name: decodedToken.name, msg: msg, time: (new Date()).getTime() });
                        io.emit("ping", { target: target, from: decodedToken.uid, from_name: decodedToken.name, msg: msg, time: (new Date).getTime() });
                    } else {
                        const target_convo = await conversations.findOne({
                            owner: target,
                            target: decodedToken.uid
                        });

                        const target_log = target_convo.messages;

                        target_log.push({ from: decodedToken.uid, from_name: decodedToken.name, msg: msg, time: new Date().getTime() });

                        if (target_log.length > 100) {
                            target_log.splice(0, 1);
                        }

                        // Update convo of target to be unread since target is offline
                        await conversations.updateOne({
                            owner: target,
                            target: decodedToken.uid
                        }, { $set: { messages: target_log, unread: true } });

                        io.emit("ping", { target: target, from: decodedToken.uid, from_name: decodedToken.name, msg: msg, time: (new Date).getTime() });
                    }
                })
                .catch(() => {
                    io.emit("error", { msg: "Invalid target" });
                });
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

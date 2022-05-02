const functions = require("firebase-functions");
const express = require("express");
const helmet = require("helmet");
const ejs = require("ejs");

const source = require("./src/app");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(helmet.contentSecurityPolicy({
    directives: {
        "script-src": [
            "self",
            "http://localhost:3000/client.js",
            "http://localhost:3000/footer.js",
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

exports.app = functions.https.onRequest(app);

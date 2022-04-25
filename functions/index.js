const functions = require("firebase-functions");
const express = require("express");
const helmet = require("helmet");
const ejs = require("ejs");

const source = require("./src/app");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        "script-src": ['self', "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"]
    }
}));
app.use('/', source);

exports.app = functions.https.onRequest(app);

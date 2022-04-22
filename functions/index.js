const functions = require("firebase-functions");
const express = require("express");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const source = require("./src/app");
const app = express();

app.set("view engine", "ejs");

app.use(helmet());
app.use(bodyParser.json());
app.use('/home', source);

exports.app = functions.https.onRequest(app);
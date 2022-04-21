const express = require("express");
const helmet = require("helmet");
const ejs = require("ejs");

const source = require("./src/app");
const app = express();

const PORT = 3000;

app.set("view engine", "ejs");

app.use(helmet());
app.use('/', source);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
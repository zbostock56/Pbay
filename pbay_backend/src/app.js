const express = require("express");
const app = express();

app.get("/", (req, res) => {
    console.log("Home");
    res.render("pages/index");
});

module.exports = app;
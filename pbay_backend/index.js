const express = require("express");
const helmet = require("helmet");

const source = require("./src/app");
const app = express();

const PORT = 3000;

app.use(helmet());
app.use('/', source);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
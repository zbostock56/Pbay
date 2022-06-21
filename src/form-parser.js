const os = require("os");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

/*
  ============= formParser =============
  DESC: Middleware for parsing multipart form
  requests

  PARAMETERS: All neccesarry middleware params (req, res, next)

  RETURNS:
  req.body contains the given arguments passed
  by the request
  ==========================================
*/

const formParser = (req, res, next) => {
    if ((req.method !== 'POST') || (!req.busboy)) {
        next();
    }

    const tempDir = os.tmpdir();

    const fields = {};
    const writes = [];
    const uploads = {};

    req.busboy.on("field", (name, value) => {
        fields[name] = value;
    });

    req.busboy.on("file", (field, file, info) => {
        if (info.filename) {
            const filepath = path.join(tempDir, info.filename);
            const writeStream = fs.createWriteStream(filepath);
    
            uploads[info.filename] = filepath;
    
            file.pipe(writeStream);
    
            const promise = new Promise((resolve, reject) => {
                file.on("limit", () => {
                  writeStream.end();
                  res.status(400).json({ msg: "Uploaded file cannot be more than 2MB" });
                });

                file.on("end", () => {
                    writeStream.end();
                });
                writeStream.on("finish", resolve);
                writeStream.on("error", reject);
            });
    
            writes.push(promise);
        } else {
            file.resume();
        }
    });

    req.busboy.on("finish", async () => {
        await Promise.all(writes);

        req.body = fields;

        req.body.imgs = [];
        for (const file in uploads) {
            const filename = uploads[file];

            const uncompressed = fs.readFileSync(filename);
            await sharp(uncompressed).resize({ width: 500 }).toBuffer()
            .then((data) => {
                req.body.imgs.push(data);
            })
            .catch((err) => {
                console.log(err);
                res.status(400).json({ msg: err });
            });

            fs.unlinkSync(filename);
        }

        next();
    });

    req.busboy.on("error", (err) => {
        res.status(400).json({ msg: err.message });
    });
};

module.exports = formParser;

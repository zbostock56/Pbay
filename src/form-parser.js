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
        try {
            if (info.filename) {
                const filepath = path.join(tempDir, info.filename);
                const writeStream = fs.createWriteStream(filepath);

                uploads[info.filename] = filepath;

                file.pipe(writeStream);

                const promise = await new Promise((resolve, reject) => {
                    file.on("limit", () => {
                        writeStream.end();
                        reject({ message: "Uploaded files cannot total more than 6MB" });
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
        } catch (err) {
            return res.status(400).json({ msg: err.message });
        }
    });

    req.busboy.on("finish", async () => {
        try {
            await Promise.all(writes);

            req.body = fields;

            req.body.imgs = [];
            for (const file in uploads) {
                const filename = uploads[file];

                const uncompressed = fs.readFileSync(filename);
                const data = await sharp(uncompressed).resize({ width: 500 }).toBuffer()
                req.body.imgs.push(data);

                fs.unlinkSync(filename);
            }

            next();
        } catch (err) {
            return res.status(400).json({ msg: err.message });
        }
    });

    req.busboy.on("error", (err) => {
        res.status(400).json({ msg: err.message });
    });
};

module.exports = formParser;

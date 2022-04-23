const busboy = require("busboy");
const os = require("os");
const path = require("path");
const fs = require("fs");

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
    if (req.method !== 'POST') {
        next();
    }

    const bb = busboy({
        headers: req.headers,
        /*limits: {
            fileSize: 1024 * 1024
        }*/
    });

    const tempDir = os.tmpdir();

    const fields = {};
    const writes = [];
    const uploads = {};

    bb.on("field", (name, value) => {
        fields[name] = value;
    });

    bb.on("file", (field, file, info) => {
        if (info.filename) {
            const filepath = path.join(tempDir, info.filename);
            const writeStream = fs.createWriteStream(filepath);
    
            uploads[field] = filepath;
    
            file.pipe(writeStream);
    
            const promise = new Promise((resolve, reject) => {
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

    bb.on("finish", async () => {
        await Promise.all(writes);

        req.body = fields;

        for (const file in uploads) {
            const filename = uploads[file];

            req.body[file] = fs.readFileSync(filename);
            fs.unlinkSync(filename);
        }

        next();
    });

    bb.on("error", (err) => {
        res.status(400).json({ msg: err.message });
    });

    bb.end(req.rawBody);
};

module.exports = formParser;
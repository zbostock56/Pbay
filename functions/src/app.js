const { initializeApp } = require("firebase/app");
const { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator, onAuthStateChanged, signOut } = require("firebase/auth");
const { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, connectStorageEmulator } = require("firebase/storage");

const firebaseConfig = {
    apiKey: "AIzaSyBtuKD3x-8ggb5UoZsuX4MF-qQhoIMK0_k",
    authDomain: "pbay-51219.firebaseapp.com",
    projectId: "pbay-51219",
    storageBucket: "pbay-51219.appspot.com",
    messagingSenderId: "825090402653",
    appId: "1:825090402653:web:33cf280f3e6c071bbe20b4",
    measurementId: "G-F5FKK2C9M4"
};

const fb = initializeApp(firebaseConfig);
const db = getFirestore(fb);
const auth = getAuth();
const storage = getStorage(fb);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "localhost", 9199);

const express = require("express");
const busboy = require("busboy");
const os = require("os");
const path = require("path");
const fs = require("fs");

const app = express();

const listings = [
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Listing 2",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Listing 3",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Listing 4",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "No Picture",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50"
    },
    {
        title: "No Description",
        desc: "",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Fuck me!",
    },
    {
        title: "No Location",
        desc: "This",
        img: "supposed to be something here",
        src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
        time: "4/21/22 7:47 PM",
        location: "",
        phone_number: "(317) 501-5372",
        price: "100.50"
    }
];

const test = [ "test" ];

// DOC TEMPLATE
/*
  ==========  ==========
  DESC: 

  PARAMETERS:

  RETURNS:
  =================================
*/

// app.get("/item", async (req, res) => {
//     try {
//         const snapshot = await getDocs(collection(db, "test"));
//         res.status(200).json({ docs: snapshot, message: "Docs successfully read" });    
//     } catch (err) {
//         res.status(400).json({ message: err });
//     }
// });

// ============ AUTHENTICATION ============

/*
  ========== POST /signup ==========
  DESC: 
  Creates a new user from a given email and password

  PARAMETERS:
  email (String): Email of new account, must be a purdue.edu email
  password (String): Password of new account, must be at least 6 characters

  RETURNS:
  status:
   - 200: success
   - 400: failture

  code: Code corresponding to request status

  msg: message relating to the status of the request
  =================================
*/
app.post("/signup", (req, res) => {
    const email = req.body.email;

    const validEmail = new RegExp("..\*@purdue.edu\$");

    if(validEmail.test(email) == false) {
        res.status(400).json({ msg: "Email must be a valid purdue.edu email (auth/invalid-email)"});
    }

    createUserWithEmailAndPassword(auth, req.body.email, req.body.password).then((cred) => {
        res.status(200).json({ msg: "User successfully created" });
    }).catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

/*
  ========== POST /login ==========
  DESC: 
  Signs in an existing user

  PARAMETERS:
  email (String): Email of desired account
  password (String): Password of desired account

  RETURNS:
  status:
   - 200: success
   - 400: failture

  code: Code corresponding to request status

  msg: message relating to the status of the request
  =================================
*/
app.post("/login", (req, res) => {
    signInWithEmailAndPassword(auth, req.body.email, req.body.password).then((cred) => {
        res.status(200).json({ msg: "Successfully signed in" });
    }).catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

/*
  ========== POST /logout ==========
  DESC: Logs the current user out

  PARAMETERS: N/A

  RETURNS:
  status:
   - 200: success
   - 400: failture

  msg: Message relating to request status
  =================================
*/
app.post("/logout", (req, res) => {
    signOut(auth).then(() => {
        res.status(200).json({ msg: "Successfully signed out" });
    }).catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

// =============== LISTINGS ===============

const parseMultiPart = (req, res, next) => {
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

/*
  ========== POST /create_listing ==========
  DESC: Create a new sell listing

  PARAMETERS:
  title (String): Title of new listing
  desc (String): Optional description of new listing
  location (String): Location of new listing
  phoneNumber (String): Phone number of seller in form (xxx)-xxx-xxxx
  price (Number): Price of listing
  img (File): Image of listing item

  RETURNS:
  status:
   - 200: success
   - 400: failture
  =================================
*/
app.post("/create_listing", parseMultiPart, async (req, res) => {
    const user = auth.currentUser;

    if (!user) {
        res.status(400).json({  msg: "Invalid user (auth/invalid-user)" });
    }

    const validation = validateListing(req);
    if (!(validation.status)) {
        res.status(400).json({ msg: `Invalid listing: ${validation.msg} (request/invalid-listing)` });
    }

    const time = new Date();
    let hour = time.getHours();
    let timeOfDay = "AM";
    if (time.getHours() > 12) {
        timeOfDay = "PM";
        hour -= 12;
    }

    const imgID = `${user.email}+${req.body.title}+${time.getTime()}`

    try {
        const storageRef = ref(storage, `images/${imgID}`);
        let imgUrl = "";

        const metadata = {
            contentType: 'image/jpeg'
        };

        const uploadTask = uploadBytesResumable(storageRef, req.body.img, metadata);

        uploadTask.on('state_changed', (snapshot) => {}, (err) => {
            res.status(400).json({ msg: err.message });
        }, async () => {
            imgUrl = await getDownloadURL(uploadTask.snapshot.ref);

            await addDoc(collection(db, "listings"), {
                title: req.body.title,
                desc: req.body.desc,
                location: req.body.location,
                phoneNumber: req.body.phoneNumber,
                price: parseInt(req.body.price),
                img: imgUrl,
                time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${time.getMinutes()} ${timeOfDay}`,
            });

            res.status(200).json({ msg: "Listing created" });
        });
    } catch (err) {
        res.status(400).json({ msg: err.message });   
    }
});

app.get("/create_listing", (req, res) => {
    res.render("pages/test");
});

// app.post("/edit_listing", (req, res) => {

// });

// app.delete("/delete_listing", (req, res) => {

// });

// ================== CHAT ==================



// ================ ROUTING =================

app.get("/home", (req, res) => {
    res.render("pages/index", { listings: listings });
});

/*
    title: "Listing 1",
    desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    img: "supposed to be something here",
    src: "C:\Users\ZB56\Documents\2 - Programming Projects\Pbay\pbay_backend\views\partials\Purdue ID Picture-2.jpg",
    time: "4/21/22 7:47 PM",
    location: "Owen Hall",
    phone_number: "(317) 501-5372",
    price: "100.50"
*/

// =========== HELPER FUNCTIONS ===========

const validateListing = (req) => {
    const res = {
        status: true,
        msg: ""
    }

    const title = req.body.title;
    if ((typeof title !== "string") || (title.length > 100) || (title.length === 0)) {
        res.status = false;
        res.msg = `${res.msg}Invalid title\n`;
    }

    const desc = req.body.desc;
    if ((typeof desc !== "string") || (desc.length > 500)) {
        res.status = false;
        res.msg = `${res.msg}Invalid description\n`;
    }

    // const img = req.body.img;
    // if (!(img instanceof Blob)) {
    //     res.status = false;
    //     res.msg = `${res.msg}Invalid img\n`;
    // }

    const location = req.body.location;
    if ((typeof location !== "string") || (location.length > 50) || (title.length === 0)) {
        res.status = false;
        res.msg = `${res.msg}Invalid location\n`;
    }

    const phoneValidator = /^\([0-9]{3}\)-[0-9]{3}-[0-9]{4}$/;
    const phoneNumber = req.body.phoneNumber;
    if ((typeof phoneNumber !== "string") || (phoneValidator.test(phoneNumber) == false)) {
        res.status = false;
        res.msg = `${res.msg}Invalid phone number\n`;
    }

    const price = req.body.price;
    if (parseInt(price) == NaN) {
        res.status = false;
        res.msg = `${res.msg}Invalid price\n`;
    }

    return res;
};

module.exports = app;
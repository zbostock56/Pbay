const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");

const fb = initializeApp({
    credential: applicationDefault(),
});

const express = require("express");
const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

const url = "mongodb://localhost:27017";
const client = new MongoClient(url);
let db;

client.connect().then(() => {
    db = client.db("Pbay");
    console.log(`Connected to database at: ${url}`);
}).catch((err) => {
    console.log(err);
});

const formParser = require("./form-parser");
const listingValidator = require("./listing-validator");
const requestValidator = require("./request-validator");
const imgValidator = require("./img-validator");

const app = express();

const listings = [
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "this is a tag!",
        id: "a",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`
    },
    {
        title: "Listing 2",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tag: "here is the story of a man who once was large",
        id: "b",
        timeID: `${(new Date()).getTime() }`
    },
    {
        title: "Listing 3",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "This is a tag",
        id: "c",
        timeID: `${(new Date()).getTime() - 86400000 * 15 }`
    },
    {
        title: "Listing 4",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "This is the best thing in the world",
        id: "d",
        timeID: `${(new Date()).getTime() - 86400000 * 20 }`
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Please help me",
        id: "e",
        timeID: `${(new Date()).getTime() - 86400000 * 50 }`
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Yes!",
        id: "f",
        timeID: `${(new Date()).getTime() - 86400000 * 2 }`
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "crypto currency",
        id: "g",
        timeID: `${(new Date()).getTime() - 86400000 * 3 }`
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "crypto currency",
        id: "h",
        timeID: `${(new Date()).getTime() - 86400000 * 5 }`
    },
    {
        title: "Test",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Hello world",
        id: "i",
        timeID: `${(new Date()).getTime() - 86400000 * 4 }`
    },
    {
        title: "No Picture",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Consumer Goods",
        id: "j",
        timeID: `${(new Date()).getTime() - 86400000 * 5 }`
    },
    {
        title: "No Description",
        desc: "",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Fuck me!",
        id: "k",
        timeID: `${(new Date()).getTime() - 86400000 * 100 }`
    },
    {
        title: "No Location",
        desc: "This",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "",
        phone_number: "(317) 501-5372",
        price: "100.50",
        tags: "Test",
        id: "l",
        timeID: `${(new Date()).getTime() - 86400000 * 80 }`
    }
];

// DOC TEMPLATE
/*
  ==========  ==========
  DESC: 

  PARAMETERS:

  RETURNS:
  =================================
*/

// ========================= LISTINGS =========================

/*
  ========== POST /create_listing ==========
  DESC: Create a new sell listing

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - title (String, required): Title of new listing
   - desc (String, required): Optional description of new listing
   - location (String, required): Location of new listing
   - phoneNumber (String, required): Phone number of seller in form (xxx)-xxx-xxxx
   - price (Number, required): Price of listing
   - img (File, optional): Image of listing item

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ==========================================
*/
app.post("/create_listing", formParser, listingValidator, imgValidator, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        // Calculate timestamp info
        const time = new Date();
        let hour = time.getHours();
        let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
        let timeOfDay = "AM";
        if (time.getHours() > 12) {
            timeOfDay = "PM";
            hour -= 12;
        }

        // Create image id in the form {EMAIL}+{IMAGE_TITLE}+{TIME}
        const imgID = `${uid}+${req.body.title}+${time.getTime()}`

        try {
            const listings = db.collection("listings");
            if (req.body.img) {
                fs.open(`../public/images/${imgID}.jpg`, "w", (err, fd) => {
                    if (err) {
                        res.status(400).json({ msg: err.message });
                    }

                    fs.write(fd, req.body.img, 0, (err, written, buffer) => {
                        if (err) {
                            res.status(400).json({ msg: err.message });
                        }
                    });
                    fs.close(fd);
                });
                
                await listings.insertOne({
                    user: uid,
                    title: req.body.title,
                    desc: req.body.desc,
                    location: req.body.location,
                    phoneNumber: req.body.phoneNumber,
                    price: parseInt(req.body.price),
                    img: `http://localhost:3000/images/${imgID}.jpg`,
                    imgID: imgID,
                    timeID: time.getTime()
                }).then(() => {
                    res.status(200).json({ msg: "Success" });
                }).catch((err) => {
                    res.status(400).json({ msg: err.message });
                });
            } else {
                await listings.insertOne({
                    user: uid,
                    title: req.body.title,
                    desc: req.body.desc,
                    location: req.body.location,
                    phoneNumber: req.body.phoneNumber,
                    price: parseInt(req.body.price),
                    img: "",
                    imgID: "",
                    timeID: time.getTime()
                }).then(() => {
                    res.status(200).json({ msg: "Success (non pic)" });
                }).catch((err) => {
                    res.status(400).json({ msg: err.message });
                });
            }

            // Send success message
            res.status(200).json({ msg: "Listing created" });
        } catch (err) {
            // Send error message on error
            res.status(400).json({ msg: err.message });   
        }
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

/*
  ========== POST /edit_listing ==========
  DESC: Edit a current sell listing

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - listing (String, required): id of listing to be edited
   - title (String, optional): Title of new listing
   - desc (String, optional): Optional description of new listing
   - location (String, optional): Location of new listing
   - phoneNumber (String, optional): Phone number of seller in form (xxx)-xxx-xxxx
   - price (Number, optional): Price of listing
   - img (File, optional): Image of listing

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  =================================
*/
app.post("/edit_listing", formParser, listingValidator, imgValidator, async (req, res) => {
    const auth = getAuth();
    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const listings = db.collection("listings");
        const _id = new mongo.ObjectId(req.body.listing);
        const listing = await listings.findOne({ _id: _id });

        if (listing) {
            if (uid === listing.user) {
                const update = genListingUpdate(listing, req);

                const oldImgID = listing.imgID;

                const timeID = new Date().getTime();
                const imgID = `${uid}+${req.body.title}+${timeID}`;

                try {
                    if (req.body.img) {
                        fs.open(`../public/images/${imgID}.jpg`, "w", (err, fd) => {
                            if (err) {
                                res.status(400).json({ msg: err.message });
                            }

                            fs.write(fd, req.body.img, (err, written, buffer) => {
                                if (err) {
                                    res.status(400).json({ msg: err.message });
                                }
                            });

                            fs.close(fd);
                        });

                        update.img = `http://localhost:3000/images/${imgID}.jpg`;
                        update.imgID = imgID;
                    } else {
                        update.img = "";
                        update.imgID = "";
                    }

                    fs.access(`../public/images/${oldImgID}.jpg`, async (doesntExist) => {
                        if (doesntExist) {
                            await listings.update({ _id: _id }, { $set: update })
                            .then(() => {
                                res.status(200).json({ msg: "Listing updated" });
                            })
                            .catch((err) => {
                                res.status(400).json({ msg: err.message });
                            });
                        } else {
                            fs.unlink(`../public/images/${oldImgID}.jpg`, async (err) => {
                                if (err) {
                                    res.status(400).json({ msg: err.message });
                                }

                                await listings.update({ _id: _id }, { $set: update })
                                .then(() => {
                                    res.status(200).json({ msg: "Listing updated" });
                                })
                                .catch((err) => {
                                    res.status(400).json({ msg: err.message });
                                });
                            });
                        }
                    });
                } catch (err) {
                    res.status(400).json({ msg: err.message });
                }
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid listing" });
        }
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

/*
  ========== DELETE /delete_listing ==========
  DESC: Delete a current sell listing

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - listing (String, required): The id of the desired listing to delete

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ============================================
*/
app.post("/delete_listing", formParser, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const listings = db.collection("listings");
        const _id = new mongo.ObjectId(req.body.listing);
        const listing = await listings.findOne({ _id: _id });

        if(listing) {
            if (listing.user == uid) {
                if (listing.imgID != "") {
                    fs.unlink(`../public/images/${listing.imgID}.jpg`, (err) => {
                        if (err) {
                            res.status(400).json({ msg: err.message });
                        }
                    });
                }

                await listings.deleteOne({ _id: _id });

                res.status(200).json({ msg: "Listing deleted" });
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid listing" });
        }
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

// ========================== REQUESTS ==========================

/*
  ========== POST /create_request ==========
  DESC: Create a new request for an item

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - title (String, required): Title of request
   - desc (String, required): Description of item request

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ==========================================
*/
app.post("/create_request", formParser, requestValidator, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const time = new Date();
        let hour = time.getHours();
        let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;
        let timeOfDay = "AM";
        if (hour > 12) {
            timeOfDay = "PM";
            hour -= 12;
        }

        const requests = db.collection("requests");
        await requests.insertOne({
            user: uid,
            title: req.body.title,
            desc: req.body.desc,
            timeId: time.getTime()
        })
        .then(() => {
            res.status(200).json({ msg: "Request created" });
        })
        .catch((err) => {
            res.status(400).json({ msg: err.message });
        });
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    });
});

/*
  ========== POST /edit_request ==========
  DESC: Edit a current buy request

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - request (String, required): id of request to edit
   - title (String, optional): New title of request
   - desc (String, optional): New description of request

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  =================================
*/
app.post("/edit_request", formParser, requestValidator, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const requests = db.collection("requests");
        const _id = new mongo.ObjectId(req.body.request)
        const request = await requests.findOne({ _id: _id });

        if (request) {
            if (uid === request.user) {
                const update = genRequestUpdate(request, req);

                await requests.updateOne({ _id: _id }, { $set: update })
                .then(() => {
                    res.status(200).json({ msg: "Request updated" });
                })
                .catch((err) => {
                    res.status(400).json({ msg: err.message });
                });
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid request" });
        }
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    })
});

/*
  ========== POST /delete_request ==========
  DESC: Delete a current item request

  PARAMETERS:
   - idToken (Stirng, required): authenetication token of current user
   - request (String, required): id of request to delete

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ==========================================
*/
app.post("/delete_request", formParser, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const requests = db.collection("requests");
        const _id = new mongo.ObjectId(req.body.request);
        const request = await requests.findOne({ _id: _id });

        if (request) {
            if (uid === request.user) {
                await requests.deleteOne({ _id: _id });

                res.status(200).json({ msg: "Request deleted" });
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid request" });
        }
    })
    .catch((err) => {
        res.status(400).json({ msg: err.message });
    });
    // const user = auth.currentUser;

    // if (!user) {
    //     res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
    // }

    // const requestRef = doc(db, "requests", req.body.request);
    // const requestSnapshot = await getDoc(requestRef);

    // if (requestSnapshot.data()) {
    //     if (user.email === requestSnapshot.data().email) {
    //         try {
    //             await deleteDoc(requestRef);
    //             res.status(200).json({ msg: "Request deleted" });
    //         } catch(err) {
    //             res.status(400).json({ msg: err.message });
    //         }
    //     } else {
    //         res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
    //     }
    // } else {
    //     res.status(400).json({ msg: "Invalid listing" });
    // }
});

// ============================ CHAT ============================

// ========================== REPORTING =========================

// app.post("/report", formParser, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
//     }
// });

// ========================== ROUTING ===========================

app.get("/home", (req, res) => {
    res.render("pages/index", { listings: listings });
});

app.get("/login", (req, res) => {
    res.render("pages/login");
});

app.get("home/create_listing", (req, res) => {
    res.render("pages/create_post");
});
app.get("/terms", (req, res) => {
    res.render("pages/terms_and_conditions");
});
app.get("/maintence", (req, res) => {
    res.render("pages/maintence");
});
app.get("/404", (req, res) => {
    res.render("pages/404");
});

// Categories
app.get("home/appliances", (req, res) => {
    res.render("pages/categories/appliances");
});
app.get("home/beauty", (req, res) => {
    res.render("pages/categories/beauty");
});
app.get("home/books", (req, res) => {
    res.render("pages/categories/books");
});
app.get("home/car", (req, res) => {
    res.render("pages/categories/car");
});
app.get("home/clothing", (req, res) => {
    res.render("pages/categories/clothing");
});
app.get("home/computer", (req, res) => {
    res.render("pages/categories/computer_hardware");
});
app.get("home/food", (req, res) => {
    res.render("pages/categories/food");
});
app.get("home/furniture", (req, res) => {
    res.render("pages/categories/furniture");
});
app.get("home/health", (req, res) => {
    res.render("pages/categories/health");
});
app.get("home/decor", (req, res) => {
    res.render("pages/categories/home_decor");
});
app.get("home/jewelry", (req, res) => {
    res.render("pages/categories/jewelry");
});
app.get("home/kitchenware", (req, res) => {
    res.render("pages/categories/kitchenware");
});
app.get("home/media", (req, res) => {
    res.render("pages/categories/media");
});
app.get("home/office", (req, res) => {
    res.render("pages/categories/office_supplies");
});
app.get("home/other", (req, res) => {
    res.render("pages/categories/other");
});
app.get("home/outdoors", (req, res) => {
    res.render("pages/categories/outdoors_travel");
});
app.get("home/pet", (req, res) => {
    res.render("pages/categories/pet");
});
app.get("home/shoes", (req, res) => {
    res.render("pages/categories/shoes");
});
app.get("home/sporting", (req, res) => {
    res.render("pages/categories/sporting");
});
app.get("home/toys", (req, res) => {
    res.render("pages/categories/toys");
});

// TEST ROUTES

app.get("/login_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_login");
});

app.get("/create_listing_test", (req, res) => {
    res.render("pages/TEST_PAGES/test");
});

app.get("/edit_listing_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_edit_listing");
});

app.get("/delete_listing_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_delete_listing");
});

app.get("/create_request_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_create_request");
});

app.get("/edit_request_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_edit_request");
});

app.get("/delete_request_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_delete_request");
})

// ========================== HELPERS ===========================

/*
  ========== genListingUpdate ==========
  DESC: Generate the update object that will be sent to firebase
  to update a given listing

  PARAMETERS:
   - data (Object): Object containing the current state of the
  listing
   - req (Object): Request object from the updated fields from
   the client

  RETURNS:
  The update object for the updated listing
  ======================================
*/
const genListingUpdate = (data, req) => {
    const update = {};

    if (req.body.title != "" && (data.title != req.body.title)) {
        update.title = req.body.title;
    }

    if (req.body.desc != "" && (data.desc != req.body.desc)) {
        update.desc = req.body.desc;
    }

    if (req.body.location != "" && (data.location != req.body.location)) {
        update.location = req.body.location;
    }

    if (req.body.phoneNumber != "" && (data.phoneNumber != req.body.phoneNumber)) {
        update.phoneNumber = req.body.phoneNumber;
    }
    if (req.body.price != "" && (data.price != req.body.price)) {
        update.price = req.body.price;
    }

    return update;
}

/*
  ========== genRequestUpdate ==========
  DESC: Generate the update object that will hold the fields
  containing the given listings to update

  PARAMETERS:
   - data (Object): Object containing the current state of the
  request
   - req (Object): Request object from the updated fields from
  the client

  RETURNS:
  The update object for the updated request
  ======================================
*/
const genRequestUpdate = (data, req) => {
    const update = {};

    if (req.body.title != "" && (data.title != req.body.title)) {
        update.title = req.body.title;
    }

    if (req.body.desc != "" && (data.desc != req.body.desc)) {
        update.desc = req.body.desc;
    }

    return update;
}

module.exports = app;
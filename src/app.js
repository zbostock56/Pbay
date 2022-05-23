const admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");
const fs = require("fs");

const express = require("express");
const app = express();

const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

const url = "mongodb://127.0.0.1:27017";
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

const IMG_DIR = "./public/images/listing_imgs";

const CATEGORIES = [ "appliances", "beauty", "books", "car_supplies", "clothing", "computer_hardware", "food",
                     "furniture", "health", "home_decor", "jewelry", "kitchenware", "media", "outdoor_travel", "pet", 
                     "office_supplies", "sporting", "toys", "other" ];

const message_rooms = [
    {
        to: "Alexander the Great",
        hasNewMessage: false,
        url: "",
    },
    {
        to: "Ceasar",
        hasNewMessage: true,
        url: "",
    },
    {
        to: "Ghangis Khan",
        hasNewMessage: false,
        url: "",
    },
    {
        to: "King Henry VIII",
        hasNewMessage: true,
        url: "",
    },
    {
        to: "Shiwhandi",
        hasNewMessage: false,
        url: "",
    },
    {
        to: "Napolean",
        hasNewMessage: true,
        url: "",
    }
];

const messages = [
    {
        // Denotes whether the message was sent from the current user or from the opposing person
        from: "Ghengis Khan",
        to: "Alexander the Great",
        contents: "Hello, welcome to the multiverse of madness. I am your host, MatPat.",
        // This is something we are probably going to want
        timeStamp: "",
    },
    {
        fromCurrentUser: false,
        contents: "Fuck you MatPat, I hate your videos and I know that you're a conspiracy theorist."
    },
    {
        fromCurrentUser: true,
        contents: "Hey man, that really hurt. You should go out and rethink your life. I mean, would you say that to your mom?"
    },
    {
        fromCurrentUser: false,
        contents: "Well, I'm not sure, but I just thought it was funny."
    },
    {
        fromCurrentUser: false,
        contents: "Can you at least give it to me that it was a bit funny?"
    },
    {
        fromCurrentUser: true,
        contents: "Yeah, I guess so."
    },
    {
        fromCurrentUser: true,
        contents: "You kind of have a point..."
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

        // Create image id in the form {EMAIL}+{IMAGE_TITLE}+{TIME}
        const imgID = `${uid}+${req.body.title}+${time.getTime()}`

        try {
            const listings = db.collection("listings");
            if (req.body.img) {
                fs.open(`${IMG_DIR}/${imgID}.jpg`, "w", (err, fd) => {
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
                    category: parseInt(req.body.category),
                    //location: req.body.location,
                    //phoneNumber: req.body.phoneNumber,
                    price: parseFloat(req.body.price).toFixed(2),
                    img: `http://localhost:3000/images/listing_imgs/${imgID}.jpg`,
                    imgID: imgID,
                    timeID: time.getTime()
                }).then(() => {
                    res.status(200).json({ msg: "Success" });
                }).catch((err) => {
                    if (err) {
                        res.status(400).json({ msg: err.message });
                    }
                });
            } else {
                await listings.insertOne({
                    user: uid,
                    title: req.body.title,
                    desc: req.body.desc,
                    category: parseInt(req.body.category),
                    //location: req.body.location,
                    //phoneNumber: req.body.phoneNumber,
                    price: parseFloat(req.body.price).toFixed(2),
                    img: "",
                    imgID: "",
                    timeID: time.getTime()
                }).then(() => {
                    res.status(200).json({ msg: "Success" });
                }).catch((err) => {
                    if (err) {
                        res.status(400).json({ msg: err.message });
                    }
                });
            }
        } catch (err) {
            // Send error message on error
            res.status(400).json({ msg: err.message });   
        }
    })
    .catch((err) => {
        if (err) {
            res.status(400).json({ msg: err.message });
        }
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
                        fs.open(`${IMG_DIR}/${imgID}.jpg`, "w", (err, fd) => {
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

                        update.img = `http://localhost:3000/images/listing_imgs/${imgID}.jpg`;
                        update.imgID = imgID;
                    } else {
                        update.img = "";
                        update.imgID = "";
                    }

                    fs.access(`${IMG_DIR}/${oldImgID}.jpg`, async (doesntExist) => {
                        if (doesntExist) {
                            await listings.update({ _id: _id }, { $set: update })
                            .then(() => {
                                res.status(200).json({ msg: "Listing updated" });
                            })
                            .catch((err) => {
                                if (err) {
                                    res.status(400).json({ msg: err.message });
                                }
                            });
                        } else {
                            fs.unlink(`${IMG_DIR}/${oldImgID}.jpg`, async (err) => {
                                if (err) {
                                    res.status(400).json({ msg: err.message });
                                }

                                await listings.update({ _id: _id }, { $set: update })
                                .then(() => {
                                    res.status(200).json({ msg: "Listing updated" });
                                })
                                .catch((err) => {
                                    if (err) {
                                        res.status(400).json({ msg: err.message });
                                    }
                                });
                            });
                        }
                    });
                } catch (err) {
                    if (err) {
                        res.status(400).json({ msg: err.message });
                    }
                }
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid listing" });
        }
    })
    .catch((err) => {
        if (err) {
            res.status(400).json({ msg: err.message });
        }
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
                    fs.unlink(`${IMG_DIR}/${listing.imgID}.jpg`, (err) => {
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
        if (err) {
            res.status(400).json({ msg: err.message });
        }
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
            if (err) {
                res.status(400).json({ msg: err.message });
            }
        });
    })
    .catch((err) => {
        if (err) {
            res.status(400).json({ msg: err.message });
        }
    });
});

/*
  ========== POST /edit_request ==========
  DESC: Edit a current buy request

  PARAMETERS:
   - idToken (String, required): authenetication token of current user
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
                    if (err) {
                        res.status(400).json({ msg: err.message });
                    }
                });
            } else {
                res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
            }
        } else {
            res.status(400).json({ msg: "Invalid request" });
        }
    })
    .catch((err) => {
        if (err) {
            res.status(400).json({ msg: err.message });
        }
    })
});

/*
  ========== POST /delete_request ==========
  DESC: Delete a current item request

  PARAMETERS:
   - idToken (String, required): authenetication token of current user
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
        if (err) {
            res.status(400).json({ msg: err.message });
        }
    });
});

// ============================ CHAT ============================

app.get("/unread_messages/:idToken/:target", (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.params.idToken)
    .then((decodedToken) => {
        const uid = decodedToken.uid;

        admin.auth().getUser(req.params.target)
        .then(async () => {
            const messages = db.collection("messages");
            const unread = await messages.find({ target: uid, from: req.params.target }).toArray();

            res.status(200).send({ unread: unread });
        })
        .catch((err) => {
            if (err) {
                res.status(400).json({ msg: err });
            }
        })
    })
    .catch((err) => {
        if (err) {
            res.status(200).json({ msg: err });
        }
    })
});

// ========================== REPORTING =========================

// app.post("/report", formParser, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
//     }
// });

// ========================== ROUTING ===========================

// Base Routes
app.get("/home", async (req, res) => {
    const listings = await db.collection("listings").find().toArray();

    res.render("pages/index", { listings: listings });
});

app.get("/login", (req, res) => {
    res.render("pages/login");
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

app.get("/messages", (req, res) => {
    res.render("pages/messages", { message_rooms: message_rooms });
});

app.get("/chat", (req, res) => {
    res.render("pages/chat", { messages: messages });
});

// ********** Not Included in intial Build *********************

// app.get("/about", (req, res) => {
//     res.render("pages/about_us");
// });

// app.get("/profile", (req, res) => {
//     res.render("pages/profile");
// });

// ****************************************************************

// Listing Routes
app.get("/home/create_listing", (req, res) => {
    res.render("pages/create_post");
});
app.get("/home/edit_listing", (req, res) => {
    res.render("pages/edit_post");
});

// Categories
app.get("/home/category/:category", async (req, res) => {
    const category = req.params.category;
    if (CATEGORIES.includes(category)) {
        const listings = await db.collection("listings").find({ category: CATEGORIES.indexOf(category) + 1 }).toArray();
        res.render("pages/category", { category: category.replaceAll('_', ' '), listings: listings });
    } else {
        res.redirect("http://localhost:3000/404");
    }
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

app.get("/chat_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_chat");
});

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

    if (req.body.category != "" && (data.category != parseInt(req.body.category))) {
        update.category = parseInt(req.body.category);
    }

    if (req.body.location != "" && (data.location != req.body.location)) {
        update.location = req.body.location;
    }

    if (req.body.phoneNumber != "" && (data.phoneNumber != req.body.phoneNumber)) {
        update.phoneNumber = req.body.phoneNumber;
    }
    if (req.body.price != "" && (data.price != parseFloat(req.body.price))) {
        update.price = parseFloat(req.body.price).toFixed(2);
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

exports.source = app;
exports.db = db;
exports.getAuth = getAuth;
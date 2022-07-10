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

const ejs = require("ejs");
const formParser = require("./form-parser");
const listingValidator = require("./listing-validator");
const listingUpdateValidator = require("./listing-update-validator");
const requestValidator = require("./request-validator");
const requestUpdateValidator = require("./request-update-validator");
const imgValidator = require("./img-validator");

const IMG_DIR = "./public/images/listing_imgs";

const CATEGORIES = [ "appliances", "beauty", "books", "car_supplies", "clothing", "computer_hardware", "food",
                     "furniture", "health", "home_decor", "jewelry", "kitchenware", "media", "outdoor_travel", "pet", 
                     "office_supplies", "sporting", "toys", "other" ];

const DOMAIN = "https://www.pbayshop.com";
// const DOMAIN = "http://localhost:3000";

const LOAD_INCREMENT = 10;

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

        const listings = db.collection("listings");
        if (req.body.imgs && req.body.imgs.length > 0) {
            const imgUrls = [];
            const imgIDs = [];

            try {
                for (let i = 0; i < req.body.imgs.length; i++) {
                    fs.open(`${IMG_DIR}/${imgID}-${i}.jpg`, "w", (err, fd) => {
                        if (err) {
                            throw err;
                        }

                        fs.write(fd, req.body.imgs[i], 0, (err, written, buffer) => {
                            if (err) {
                                throw err;
                            }
                        });
                        fs.close(fd);
                    });

                    imgUrls.push(`${DOMAIN}/images/listing_imgs/${imgID}-${i}.jpg`);
                    imgIDs.push(`${imgID}-${i}`);
                }
            } catch (err) {
                return res.status(400).json({ msg: err.message });
            }
            
            await listings.insertOne({
                user: uid,
                title: req.body.title,
                desc: req.body.desc,
                category: parseInt(req.body.category),
                //location: req.body.location,
                //phoneNumber: req.body.phoneNumber,
                price: parseFloat(req.body.price).toFixed(2),
                imgs: imgUrls,
                imgIDs: imgIDs,
                timeID: time.getTime()
            }).then(() => {
                res.status(200).json({ msg: "Success" });
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message });
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
                imgs: [],
                imgIDs: [],
                timeID: time.getTime()
            }).then(() => {
                res.status(200).json({ msg: "Success" });
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message });
            });
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
app.post("/edit_listing", formParser, listingUpdateValidator, imgValidator, async (req, res) => {
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

                const oldImgIDs = listing.imgIDs;

                const timeID = new Date().getTime();
                const imgID = `${uid}+${req.body.title}+${timeID}`;

                if (parseInt(req.body.updateImg) == 1) {
                    try {
                        if (req.body.imgs && req.body.imgs.length > 0) {
                            const imgUrls = [];
                            const imgIDs = [];

                            for (let i = 0; i < req.body.imgs.length; i++) {
                                fs.open(`${IMG_DIR}/${imgID}-${i}.jpg`, "w", (err, fd) => {
                                    if (err) {
                                        throw err;
                                    }

                                    fs.write(fd, req.body.imgs[i], (err, written, buffer) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });

                                    fs.close(fd);
                                });

                                imgUrls.push(`${DOMAIN}/images/listing_imgs/${imgID}-${i}.jpg`);
                                imgIDs.push(`${imgID}-${i}`);
                            }
    
                            update.imgs = imgUrls;
                            update.imgIDs = imgIDs;
                        } else {
                            update.imgs = [];
                            update.imgIDs = [];
                        }
                        
                        oldImgIDs.forEach((id) => {
                            fs.access(`${IMG_DIR}/${id}.jpg`, async (doesntExist) => {
                                if (!doesntExist) {
                                    fs.unlink(`${IMG_DIR}/${id}.jpg`, async (err) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                }
                            });
                        });
                        
                        await listings.updateOne({ _id: _id }, { $set: update })
                        .then(() => {
                            res.status(200).json({ msg: "Listing updated" });
                        })
                        .catch((err) => {
                            throw err;
                        });
                    } catch (err) {
                        res.status(400).json({ msg: err.message });
                    }
                } else {
                    try {
                        await listings.updateOne({ _id: _id }, { $set: update })
                        .then(() => {
                            res.status(200).json({ msg: "Listing updated" });
                        })
                        .catch((err) => {
                            throw err;
                        });
                    } catch (err) {
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
                try {
                    if (listing.imgIDs && listing.imgIDs.length > 0) {
                        listing.imgIDs.forEach((id) => {
                            fs.unlink(`${IMG_DIR}/${id}.jpg`, (err) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        });
                    }
                } catch (err) {
                    return res.status(400).json({ msg: err.message });
                }

                await listings.deleteOne({ _id: _id })
                .then(() => {
                    res.status(200).json({ msg: "Listing deleted" });
                })
                .catch((err) => {
                    res.status(400).json({ msg: err.message });
                });
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
            category: parseInt(req.body.category),
            timeID: time.getTime()
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
app.post("/edit_request", formParser, requestUpdateValidator, async (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.body.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;

        const requests = db.collection("requests");
        const _id = new mongo.ObjectId(req.body.request);
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
                await requests.deleteOne({ _id: _id })
                .then(() => {
                    res.status(200).json({ msg: "Request deleted" });
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
            const conversations = db.collection("conversations");
            const convo = await conversations.findOne({
                owner: uid,
                target: req.params.target
            });

            if (!convo) {
                return res.status(200).send({ unread: [] });
            }

            const unread = convo.messages;

            await conversations.updateOne({
                owner: uid,
                target: req.params.target
            }, { $set: {
                unread: false,
                messages: []
            }})
            .then(() => {
                res.status(200).send({ unread: unread });
            })
            .catch((err) => {
                res.status(400).json({ msg: err.message });
            });
        })
        .catch((err) => {
            if (err) {
                res.status(400).send({ msg: err.message });
            }
        })
    })
    .catch((err) => {
        if (err) {
            res.status(200).send({ msg: err.message });
        }
    })
});

// =========================== SEARCH ===========================

/*
  ========= GET /search ==========
  DESC: Given a search query, returns a list of 0 - 10 results
  with a similar title

  PARAMETERS:
   - idToken (String, required): authentication token of current user
   - query (String, required): search query
   - start (Integer, required): index to start at in the overall list of
     matching queries

  QUERIES:
   - type (String, optional): type of record to search for (listing or request)
   - category (String, optional): category of record to search for (must be one
     of categories in CATEGORIES array)

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  responses: Array of response objects matching the given query, with each object
  containing the record's title and category

  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
  ================================
*/
app.get("/search/:query", async (req, res) => {
    const type = req.query.type;
    const category = req.query.category;
    const query = req.params.query;

    const responses = [];

    const dbQuery = genDbQuery({ category: category, query: query });

    if (type && (type === "listings" || type === "requests")) {
        const collection = await db.collection(type).find(dbQuery).toArray();

        let upperLimit = 0;
        if (collection.length > LOAD_INCREMENT) {
            upperLimit = LOAD_INCREMENT;
        } else {
            upperLimit = collection.length;
        }

        for (let i = 0; i < upperLimit; i++) {
            responses.push({ id: collection[i]._id, type: type, title: collection[i].title, category: CATEGORIES[collection[i].category - 1] });
        }
    } else {
        const listings = await db.collection("listings").find(dbQuery).toArray();
        const requests = await db.collection("requests").find(dbQuery).toArray();

        let numListings = 0;
        let numRequests = 0;
        if (listings.length > (LOAD_INCREMENT / 2)) {
            numListings = (LOAD_INCREMENT / 2);
        } else {
            numListings = listings.length;
        }
        if (requests.length > (LOAD_INCREMENT / 2)) {
            numRequests = (LOAD_INCREMENT / 2);
        } else {
            numRequests = requests.length;
        }

        for (let i = 0; i < numListings; i++) {
            responses.push({ id: listings[i]._id, type: "listings", title: listings[i].title, category: CATEGORIES[listings[i].category - 1] });
        }
        for (let i = 0; i < numRequests; i++) {
            responses.push({ id: requests[i]._id, type: "requests", title: requests[i].title, category: CATEGORIES[requests[i].category - 1] });
        }
    }

    res.status(200).send({ responses: responses });
});

/*
  ========= GET /search_user ==========
  DESC: Given a search query, returns a list of 0 - 10 results
  with a similar title belonging to the given user

  PARAMETERS:
   - idToken (String, required): authentication token of current user
   - query (String, required): search query
   - start (Integer, required): index to start at in the overall list of
     matching queries

  QUERIES:
   - type (String, optional): type of record to search for (listing or request)
   - category (String, optional): category of record to search for (must be one
     of categories in CATEGORIES array)

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  responses: Array of response objects matching the given query, with each object
  containing the record's title and category

  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
  ================================
*/
app.get("/search_user/:idToken/:query", (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.params.idToken)
    .then(async (decodedToken) => {
        const uid = decodedToken.uid;
        const type = req.query.type;
        const category = req.query.category;
        const query = req.params.query;

        let responses = [];

        const dbQuery = genDbQuery({ uid: uid, category: category, query: query });

        if (type && (type === "listings" || type === "requests")) {
            const collection = await db.collection(type).find(dbQuery).toArray();

            let upperLimit = 0;
            if (collection.length > LOAD_INCREMENT) {
                upperLimit = LOAD_INCREMENT;
            } else {
                upperLimit = collection.length;
            }

            for (let i = 0; i < upperLimit; i++) {
                responses.push({ id: collection[i]._id, type: type, title: collection[i].title, category: CATEGORIES[collection[i].category - 1] });
            }
        } else {
            const listings = await db.collection("listings").find(dbQuery).toArray();
            const requests = await db.collection("requests").find(dbQuery).toArray();

            let numListings = 0;
            let numRequests = 0;
            if (listings.length > (LOAD_INCREMENT / 2)) {
                numListings = (LOAD_INCREMENT / 2);
            } else {
                numListings = listings.length;
            }
            if (requests.length > (LOAD_INCREMENT / 2)) {
                numRequests = (LOAD_INCREMENT / 2);
            } else {
                numRequests = requests.length;
            }

            for (let i = 0; i < numListings; i++) {
                responses.push({ id: listings[i]._id, type: "listings", title: listings[i].title, category: CATEGORIES[listings[i].category - 1] });
            }
            for (let i = 0; i < numRequests; i++) {
                responses.push({ id: requests[i]._id, type: "requests", title: requests[i].title, category: CATEGORIES[requests[i].category - 1] });
            }
        }

        res.status(200).send({ responses: responses });
    })
    .catch((err) => {
        if (err) {
            res.status(400).send({ msg: err.message });
        }
    })
});

// ==================== INCREMENTAL POPULATION ====================

/*
  ========== GET /listtings ==========
  DESC: Returns a list of 0 - 10 listings starting at a certain position
  in the master listing list

  PARAMETERS:
   - Start (integer, required): index to start at in master list

  QUERIES:
   - idToken (String, optional): Autnentication token of current user
   - category (String, optional): category to search through

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  listings: listing object list
  
  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
*/
app.get("/listings/:start", async (req, res) => {
    let err = "";
    if (isNaN(parseInt(req.params.start))) {
        return res.status(400).send({ msg: "Invalid index" });
    }

    const category = req.query.category;
    const idToken = req.query.idToken;
    const startingIndex = parseInt(req.params.start) < 0 ? 0 : parseInt(req.params.start);

    let listings = [];
    if (category && CATEGORIES.indexOf(category) !== -1) {
        listings = await db.collection("listings").find({ category: CATEGORIES.indexOf(category) + 1 }).toArray();
    } else {
        listings = await db.collection("listings").find().toArray();
    }

    let nextIndex = -1;
    const responses = [];
    let upperLimit = 0;
    if (listings.length > startingIndex + LOAD_INCREMENT) {
        upperLimit = startingIndex + LOAD_INCREMENT;
        nextIndex = startingIndex + LOAD_INCREMENT;
    } else {
        upperLimit = listings.length;
    }
    listings.sort(compFunc);

    if (idToken){
        const auth = getAuth();
        auth.verifyIdToken(idToken)
        .then((decodedToken) => {
            uid = decodedToken.uid;

            let editable = false;
            for (let i = startingIndex; i < upperLimit; i++) {
                editable = listings[i].user === uid;
                ejs.renderFile(`${__dirname}/../views/partials/card.ejs`, { listing: listings[i], editable: editable, CATEGORIES: CATEGORIES }, (e, str) => {
                    if (e) {
                        err = e.message;
                    }

                    responses.push({ id: listings[i]._id, title: listings[i].title, category: CATEGORIES[listings[i].category - 1], html: str });
                });
            }

            if (err !== "") {
                res.status(400).json({ msg: err });
            } else {
                res.status(200).send({ listings: responses, nextIndex: nextIndex });
            }
        })
        .catch((err) => {
            res.status(400).send({ msg: err.message});
        });
    } else {
        for (let i = startingIndex; i < upperLimit; i++) {
            ejs.renderFile(`${__dirname}/../views/partials/card.ejs`, { listing: listings[i], editable: false, CATEGORIES: CATEGORIES }, (e, str) => {
                if (e) {
                    err = e.message;
                }

                responses.push({ id: listings[i]._id, title: listings[i].title, category: CATEGORIES[listings[i].category - 1], html: str });
            });
        }

        if (err !== "") {
            res.status(400).json({ msg: err });
        } else {
            res.status(200).send({ listings: responses, nextIndex: nextIndex });
        }
    }
});

/*
  ========== GET /listtings ==========
  DESC: Returns a list of 0 - 10 listings starting at a certain position
  in the master listing list that belong to the given user

  PARAMETERS:
   - idToken (String, required): Autnentication token of current user
   - Start (integer, required): index to start at in master list

  QUERIES:
   - category (String, optional): category to search through

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  listings: listing object list

  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
*/
app.get("/user_listings/:idToken/:start", (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.params.idToken)
    .then(async (decodedToken) => {
        if (isNaN(parseInt(req.params.start))) {
            return res.status(400).send({ msg: "Invalid index" });
        }
    
        const uid = decodedToken.uid;
        const category = req.query.category;
        const startingIndex = parseInt(req.params.start) < 0 ? 0 : parseInt(req.params.start);

        let listings = [];
        if (category && CATEGORIES.indexOf(category) !== -1) {
            listings = await db.collection("listings").find({ user: uid, category: CATEGORIES.indexOf(category) + 1 }).toArray();
        } else {
            listings = await db.collection("listings").find({ user: uid }).toArray();
        }
        listings.sort(compFunc);

        let nextIndex = -1;
        const responses = [];
        let upperLimit = 0;
        if (listings.length > startingIndex + LOAD_INCREMENT) {
            upperLimit = startingIndex + LOAD_INCREMENT;
            nextIndex = startingIndex + LOAD_INCREMENT;
        } else {
            upperLimit = listings.length;
        }

        for (let i = startingIndex; i < upperLimit; i++) {
            ejs.renderFile(`${__dirname}/../views/partials/card.ejs`, { listing: listings[i], editable: true, CATEGORIES: CATEGORIES }, (err, str) => {
                if (err) {
                    err = err.message;
                }

                responses.push({ id: listings[i]._id, title: listings[i].title, category: CATEGORIES[listings[i].category - 1], html: str });
            });
        }

        res.status(200).send({ listings: responses, nextIndex: nextIndex });
    })
    .catch((err) => {
        if (err) {
            res.status(400).send({ msg: err.message });
        }
    });
});

/*
  ========== GET /listing ==========
  DESC: returns a single listing from the given id

  PARAMETERS:
   - id (String, required): id of desired listing

  QUERIES:
   - idToken (String, optional): Autnentication token of current user

   RETURNS:
    status:
    - 200: success
    - 400: failure

    msg: Status message

    listing: found listing object
*/
app.get("/listing/:id", async (req, res) => {
    const idToken = req.query.idToken;

    const listing = await db.collection("listings").findOne({ _id: new mongo.ObjectId(req.params.id) });

    if (listing) {
        if (idToken) {
            const auth = getAuth();
            auth.verifyIdToken(idToken)
            .then((decodedToken) => {
                const uid = decodedToken.uid;

                const editable = listing.user === uid;
                ejs.renderFile(`${__dirname}/../views/partials/card.ejs`, { listing: listing, editable: editable, CATEGORIES: CATEGORIES }, (e, str) => {
                    if (e) {
                        return res.status(400).send({ message: e.message });
                    }

                    return res.status(200).send({ listing: { id: listing._id, title: listing.title, category: CATEGORIES[listing.category - 1], html: str } });
                });
            })
            .catch((err) => {
                return res.status(400).send({ msg: err.message });
            });
        } else {
            ejs.renderFile(`${__dirname}/../views/partials/card.ejs`, { listing: listing, editable: false, CATEGORIES: CATEGORIES }, (e, str) => {
                if (e) {
                    return res.status(400).send({ message: e.message });
                }

                return res.status(200).send({ listing: { id: listing._id, title: listing.title, category: CATEGORIES[listing.category - 1], html: str } });
            });
        }
    } else {
        res.status(400).send({ msg: "Invalid id"});
    }
});

/*
  ========== GET /requests ==========
  DESC: Returns a list of 0 - 10 requests starting at a certain position
  in the master request list

  PARAMETERS:
   - Start (integer, required): index to start at in master list

  QUERIES:
   - idToken (String, optional): Autnentication token of current user
   - category (String, optional): category to search through

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  requests: request object list
  
  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
*/
app.get("/requests/:start", async (req, res) => {
    let err = "";
    if (isNaN(parseInt(req.params.start))) {
        return res.status(400).send({ msg: "Invalid index" });
    }

    const category = req.query.category;
    const idToken = req.query.idToken;
    const startingIndex = parseInt(req.params.start) < 0 ? 0 : parseInt(req.params.start);

    let requests = [];
    if (category && CATEGORIES.indexOf(category) !== -1) {
        requests = await db.collection("requests").find({ category: CATEGORIES.indexOf(category) + 1 }).toArray();
    } else {
        requests = await db.collection("requests").find().toArray();
    }
    requests.sort(compFunc);

    let nextIndex = -1;
    const responses = [];
    let upperLimit = 0;
    if (requests.length > startingIndex + LOAD_INCREMENT) {
        upperLimit = startingIndex + LOAD_INCREMENT;
        nextIndex = startingIndex + LOAD_INCREMENT;
    } else {
        upperLimit = requests.length;
    }

    if (idToken) {
        const auth = getAuth();
        auth.verifyIdToken(idToken)
        .then((decodedToken) => {
            uid = decodedToken.uid;
            let editable = false;

            for (let i = startingIndex; i < upperLimit; i++) {
                editable = requests[i].user === uid;
                ejs.renderFile(`${__dirname}/../views/partials/request_card.ejs`, { request: requests[i], editable: editable, CATEGORIES: CATEGORIES }, (e, str) => {
                    if (e) {
                        err = e.message; 
                    }

                    responses.push({ id: requests[i]._id, title: requests[i].title, category: CATEGORIES[requests[i].category - 1], html: str });
                });
            }
            if (err !== "") {
                res.status(400).json({ msg: err });
            } else {
                res.status(200).send({ requests: responses, nextIndex: nextIndex });
            }
        })
        .catch((err) => {
            res.status(400).json({ msg: err });
        });
    } else {
        for (let i = startingIndex; i < upperLimit; i++) {
            ejs.renderFile(`${__dirname}/../views/partials/request_card.ejs`, { request: requests[i], editable: false, CATEGORIES: CATEGORIES }, (e, str) => {
                if (e) {
                    err = e.message;
                }

                responses.push({ id: requests[i]._id, title: requests[i].title, category: CATEGORIES[requests[i].category - 1], html: str });
            });
        }

        if (err !== "") {
            res.status(400).json({ msg: err });
        } else {
            res.status(200).send({ requests: responses, nextIndex: nextIndex });
        }
    }
});

/*
  ========== GET /requests ==========
  DESC: Returns a list of 0 - 10 requests starting at a certain position
  in the master request list belonging to the given user

  PARAMETERS:
   - Start (integer, required): index to start at in master list

  QUERIES:
   - idToken (String, required): Autnentication token of current user
   - category (String, optional): category to search through

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Status message

  requests: request object list
  
  nextIndex: the beginning index of the next batch of records to be send or -1 
  if no more records to be sent
*/
app.get("/user_requests/:idToken/:start", (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken((req.params.idToken))
    .then(async (decodedToken) => {
        if (isNaN(parseInt(req.params.start))) {
            return res.status(400).send({ msg: "Invalid index" });
        }

        const uid = decodedToken.uid;
        const category = req.query.category;
        const startingIndex = parseInt(req.params.start) < 0 ? 0 : parseInt(req.params.start);

        let requests = [];
        if (category && CATEGORIES.indexOf(category) !== -1) {
            requests = await db.collection("requests").find({ user: uid, category: CATEGORIES.indexOf(category) + 1 }).toArray();
        } else {
            requests = await db.collection("requests").find({ user: uid }).toArray();
        }
        requests.sort(compFunc);

        let nextIndex = -1;
        const responses = [];
        let upperLimit = 0;
        if (requests.length > startingIndex + LOAD_INCREMENT) {
            upperLimit = startingIndex + LOAD_INCREMENT;
            nextIndex = startingIndex + LOAD_INCREMENT;
        } else {
            upperLimit = requests.length;
        }

        for (let i = startingIndex; i < upperLimit; i++) {
            ejs.renderFile(`${__dirname}/../views/partials/request_card.ejs`, { request: requests[i], editable: true, CATEGORIES: CATEGORIES }, (err, str) => {
                if (err) {
                    err = err.message;
                }

                responses.push({ id: requests[i]._id, title: requests[i].title, category: CATEGORIES[requests[i].category - 1], html: str });
            });
        }

        res.status(200).send({ requests: responses, nextIndex: nextIndex });
    })
    .catch((err) => {
        if (err) {
            res.status(400).send({ msg: err.message });
        }
    });
});

/*
  ========== GET /request ==========
  DESC: returns a single request from the given id

  PARAMETERS:
   - id (String, required): id of desired request

  QUERIES:
   - idToken (String, optional): Autnentication token of current user

   RETURNS:
    status:
    - 200: success
    - 400: failure

    msg: Status message

    request: found request object
*/
app.get("/request/:id", async (req, res) => {
    const idToken = req.query.idToken;

    const request = await db.collection("requests").findOne({ _id: new mongo.ObjectId(req.params.id) });

    if (request) {
        if (idToken) {
            const auth = getAuth();
            auth.verifyIdToken(idToken)
                .then((decodedToken) => {
                    const uid = decodedToken.uid;

                    const editable = request.user === uid;
                    ejs.renderFile(`${__dirname}/../views/partials/request_card.ejs`, { request: request, editable: editable, CATEGORIES: CATEGORIES }, (e, str) => {
                        if (e) {
                            return res.status(400).send({ msg: e.message });
                        }

                        return res.status(200).send({ request: { id: request._id, title: request.title, category: CATEGORIES[request.category - 1], html: str } });
                    });
                })
                .catch((err) => {
                    return res.status(400).send({ msg: err.message });
                });
        } else {
            ejs.renderFile(`${__dirname}/../views/partials/request_card.ejs`, { request: request, editable: false, CATEGORIES: CATEGORIES }, (e, str) => {
                if (e) {
                    return res.status(400).send({ msg: e.message });
                }

                return res.status(200).send({ request: { id: request._id, title: request.title, category: CATEGORIES[request.category - 1], html: str } });
            });
        }
    } else {
        res.status(400).send({ msg: "Invalid id"});
    }
});

// ========================== REPORTING ==========================

// app.post("/report", formParser, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
//     }
// });

// ========================== ROUTING ===========================

// Base Routes
app.get("/", async (req, res) => {
    res.redirect("/home");
});
app.get("/home", async (req, res) => {
    res.render("pages/index", { listings: [], requests: [], CATEGORIES: CATEGORIES });
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

app.get("/messages/:idToken", (req, res) => {
    const idToken = req.params.idToken;

    const auth = getAuth();
    auth.verifyIdToken(idToken)
    .then(async (decodedToken) => {
        const conversations = db.collection("conversations");
        const convos = await conversations.find({ owner: decodedToken.uid }).toArray();
        res.render("pages/messages", { message_rooms: convos });
    })
    .catch((err) => {
        res.redirect(`${DOMAIN}/404`);
    });
});

app.get("/chat/:target", (req, res) => {
    const auth = getAuth();

    auth.getUser(req.params.target)
    .then((user) => {
        res.render("pages/chat");
    })
    .catch((err) => {
        res.redirect(`${DOMAIN}/404`);
    });
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

app.get("/home/my_postings/edit_listing/:listing_id", async (req, res) => {
    const listings = await db.collection("listings");

    try {
        const listing = await listings.findOne({ _id: new mongo.ObjectId(req.params.listing_id) });

        if (listing) {
            res.render("pages/edit_post");
        } else {
            res.redirect(`${DOMAIN}/404`);
        }
    } catch {
        res.redirect(`${DOMAIN}/404`);
    }
});

app.get("/home/my_postings/edit_request/:request_id", async (req, res) => {
    const requests = await db.collection("requests");

    try {
        const request = await requests.findOne({ _id: new mongo.ObjectId(req.params.request_id) });

        if (request) {
            res.render("pages/edit_request");
        } else {
            res.redirect(`${DOMAIN}/404`);
        }
    } catch {
        res.redirect(`${DOMAIN}/404`);
    }
});

app.get("/home/my_postings/:idToken", (req, res) => {
    const auth = getAuth();

    auth.verifyIdToken(req.params.idToken)
    .then( async (decodedToken) => {
        const opStatus = req.query.status;
        let successMsg = "";
        let failMsg = "";

        if (opStatus === "lc_success") {
            successMsg = "Listing successfully created";
        } else if (opStatus === "le_success") {
            successMsg = "Listing successfully edited";
        } else if (opStatus === "ld_success") {
            successMsg = "Listing successfully deleted";
        } else if (opStatus === "ld_fail") {
            failMsg = "Failed to delete listing";
        } else if (opStatus === "rc_success") {
            successMsg = "Request successfully created";
        } else if (opStatus === "re_success") {
            successMsg = "Request successfully edited";
        } else if (opStatus === "rd_success") {
            successMsg = "Request successfully deleted";
        } else if (opStatus === "rd_fail") {
            failMsg = "Failed to delete request";
        }

        res.render("pages/my_postings", {
            my_listings: [],
            my_requests: [],
            CATEGORIES: CATEGORIES,
            success_msg: successMsg,
            fail_msg: failMsg
        });
    })
    .catch((err) => {
        if (err) {
            res.redirect(`${DOMAIN}/404`);
        }
    });
});

// Categories
app.get("/home/category/:category", async (req, res) => {
    const category = req.params.category;
    if (CATEGORIES.includes(category)) {
        res.render("pages/category", { category: category.replace(/_+/g, " "), listings: [], requests: [], CATEGORIES: CATEGORIES });
    } else {
        res.redirect(`${DOMAIN}/404`);
    }
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

    if (req.body.title != undefined && (data.title != req.body.title)) {
        update.title = req.body.title;
    }

    if (req.body.desc != undefined && (data.desc != req.body.desc)) {
        update.desc = req.body.desc;
    }

    if (req.body.category != undefined && (data.category != parseInt(req.body.category))) {
        update.category = parseInt(req.body.category);
    }

    // if (req.body.location != "" && (data.location != req.body.location)) {
    //     update.location = req.body.location;
    // }

    // if (req.body.phoneNumber != "" && (data.phoneNumber != req.body.phoneNumber)) {
    //     update.phoneNumber = req.body.phoneNumber;
    // }

    if (req.body.price != undefined && (parseFloat(data.price) != parseFloat(req.body.price))) {
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

    if (req.body.title != undefined && (data.title != req.body.title)) {
        update.title = req.body.title;
    }

    if (req.body.desc != undefined && (data.desc != req.body.desc)) {
        update.desc = req.body.desc;
    }

    if (req.body.category != undefined && (data.category != parseInt(req.body.category))) {
        update.category = parseInt(req.body.category);
    }

    return update;
}

/*
  ========== compFunc ==========
  DESC: Compare function to be used in sorting the listing
  and request arrays so the arrays go from most to least
  recent.

  PARAMETERS:
   - a (Object): First listing/request object
   - b (Object): Second listing/request object

  RETURNS:
  -1: a should go before b, 1: a sould go after b, 0: The positions of
  a and b should be unchanged
  ======================================
*/
const compFunc = (a, b) => {
    if (a.timeID > b.timeID) {
        return -1;
    } else if (a.timeID < b.timeID) {
        return 1;
    } else {
        return 0;
    }
}

/*
  ========== genDbQuery ==========
  DESC: Generate a search query for the database
  based on the given options

  PARAMETERS:
   - options (object): Object containing
   query options

  RETURNS:
   - dbQuery: query object to be used when searching
   database
  ================================
*/
const genDbQuery = (options) => {
    const dbQuery = {};
    if (options.uid) {
        dbQuery.user = options.uid;
    }

    if (options.category && CATEGORIES.indexOf(options.category) !== -1) {
        dbQuery.category = CATEGORIES.indexOf(options.category) + 1;
    }

    if (options.query) {
        dbQuery.title = { '$regex': `.*${options.query}.*`, '$options': 'i' }
    }

    return dbQuery;
}

exports.source = app;

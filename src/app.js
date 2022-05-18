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

const IMG_DIR = "./public/images/listing_imgs"

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
        id: "a",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Appliances"
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
        id: "b",
        timeID: `${(new Date()).getTime() }`,
        category: "Beauty"
        
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
        id: "c",
        timeID: `${(new Date()).getTime() - 86400000 * 15 }`,
        category: "Books or Textbooks"
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
        id: "d",
        timeID: `${(new Date()).getTime() - 86400000 * 20 }`,
        category: "Car Supplies"
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
        id: "e",
        timeID: `${(new Date()).getTime() - 86400000 * 50 }`,
        category: "Clothing"
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
        id: "f",
        timeID: `${(new Date()).getTime() - 86400000 * 2 }`,
        category: "Electronics"
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
        id: "g",
        timeID: `${(new Date()).getTime() - 86400000 * 3 }`,
        category: "Food"
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
        id: "h",
        timeID: `${(new Date()).getTime() - 86400000 * 5 }`,
        category: "Furniture"
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
        id: "i",
        timeID: `${(new Date()).getTime() - 86400000 * 4 }`,
        category: "Health"
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
        id: "j",
        timeID: `${(new Date()).getTime() - 86400000 * 5 }`,
        category: "Home Decor"
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
        id: "k",
        timeID: `${(new Date()).getTime() - 86400000 * 100 }`,
        category: "Jewelry"
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
        id: "l",
        timeID: `${(new Date()).getTime() - 86400000 * 80 }`,
        category: "Kitchenware"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "m",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Media"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "n",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Outdoors and Travel"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "o",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Pet Supplies"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "p",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "School and Office Supplies"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "q",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Sporting Goods"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "r",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Toys"
    },
    {
        title: "Listing 1",
        desc: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
        img: "supposed to be something here",
        src: "",
        time: "4/21/22 7:47 PM",
        location: "Owen Hall",
        phone_number: "(317) 501-5372",
        price: "100.50",
        id: "s",
        timeID: `${(new Date()).getTime() - 86400000 * 10 }`,
        category: "Other"
    },

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
                    price: parseInt(req.body.price),
                    img: `http://localhost:3000/images/listing_imgs/${imgID}.jpg`,
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
                    category: req.body.category,
                    //location: req.body.location,
                    //phoneNumber: req.body.phoneNumber,
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
                                res.status(400).json({ msg: err.message });
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
            res.status(400).json({ msg: err });
        })
    })
    .catch((err) => {
        res.status(200).json({ msg: err });
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
app.get("/home", (req, res) => {
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

app.get("/about", (req, res) => {
    res.render("pages/about_us");
});

app.get("/profile", (req, res) => {
    res.render("pages/profile");
});

// Listing Routes
app.get("/create_listing", (req, res) => {
    res.render("pages/create_post");
});
app.get("/edit_listing", (req, res) => {
    res.render("pages/edit_post");
});

// Categories
app.get("/appliances", (req, res) => {
    res.render("pages/categories/appliances", { listings: listings });
});
app.get("/beauty", (req, res) => {
    res.render("pages/categories/beauty", { listings: listings });
});
app.get("/books", (req, res) => {
    res.render("pages/categories/books", { listings: listings });
});
app.get("/car", (req, res) => {
    res.render("pages/categories/car", { listings: listings });
});
app.get("/clothing", (req, res) => {
    res.render("pages/categories/clothing", { listings: listings });
});
app.get("/computer", (req, res) => {
    res.render("pages/categories/computer_hardware", { listings: listings });
});
app.get("/food", (req, res) => {
    res.render("pages/categories/food", { listings: listings });
});
app.get("/furniture", (req, res) => {
    res.render("pages/categories/furniture", { listings: listings });
});
app.get("/health", (req, res) => {
    res.render("pages/categories/health", { listings: listings });
});
app.get("/decor", (req, res) => {
    res.render("pages/categories/home_decor", { listings: listings });
});
app.get("/jewelry", (req, res) => {
    res.render("pages/categories/jewelry", { listings: listings });
});
app.get("home/kitchenware", (req, res) => {
    res.render("pages/categories/kitchenware", { listings: listings });
});
app.get("/media", (req, res) => {
    res.render("pages/categories/media", { listings: listings });
});
app.get("/office", (req, res) => {
    res.render("pages/categories/office_supplies", { listings: listings });
});
app.get("/other", (req, res) => {
    res.render("pages/categories/other", { listings: listings });
});
app.get("/outdoors", (req, res) => {
    res.render("pages/categories/outdoors_travel", { listings: listings });
});
app.get("/pet", (req, res) => {
    res.render("pages/categories/pet", { listings: listings });
});
app.get("/shoes", (req, res) => {
    res.render("pages/categories/shoes", { listings: listings });
});
app.get("/sporting", (req, res) => {
    res.render("pages/categories/sporting", { listings: listings });
});
app.get("/toys", (req, res) => {
    res.render("pages/categories/toys", { listings: listings });
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

    if (req.body.category != "" && (data.category != req.body.category)) {
        update.category = req.body.category;
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

exports.source = app;
exports.db = db;
exports.getAuth = getAuth;
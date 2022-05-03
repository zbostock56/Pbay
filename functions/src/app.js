const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, collection, addDoc, doc, updateDoc, getDoc, deleteDoc } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require("firebase-admin/storage");

const fb = initializeApp({
    credential: applicationDefault(),
    databaseURL: "http://127.0.0.1:8081",
    //databaseURL: "https://pbay-51219.firebaseio.com",
    //storageBucket: "gs://pbay-51219.appspot.com",
    storageBucket: "http://127.0.0.1:9199"
});
const db = getFirestore();
const storage = getStorage();

const express = require("express");

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
            if (req.body.img) {
                // Initialize Firebase storage location of image
                const storageRef = ref(storage, `images/${imgID}`);
                let imgUrl = "";

                // Define file as an image in firebase
                const metadata = {
                    contentType: 'image/jpeg'
                };

                // Upload file to firebase
                const uploadTask = uploadBytesResumable(storageRef, req.body.img, metadata);

                uploadTask.on('state_changed', (snapshot) => {}, (err) => {
                    // Return error if upload error
                    res.status(400).json({ msg: err.message });
                }, async () => {
                    // On successful upload, grab the image url from firebase
                    imgUrl = await getDownloadURL(uploadTask.snapshot.ref);

                    // Add the listing to firestore, with the image connected to the firestore listing via it's firebase storage
                    // url
                    await addDoc(collection(db, "listings"), {
                        user: uid,
                        title: req.body.title,
                        desc: req.body.desc,
                        location: req.body.location,
                        phoneNumber: req.body.phoneNumber,
                        price: parseInt(req.body.price),
                        img: imgUrl,
                        imgID: imgID,
                        //time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${minutes} ${timeOfDay}`,
                        timeID: time.getTime()
                    });
                });
            } else {
                // If no image has been uploaded, add a listing without an image
                await addDoc(collection(db, "listings"), {
                    user: uid,
                    title: req.body.title,
                    desc: req.body.desc,
                    location: req.body.location,
                    phoneNumber: req.body.phoneNumber,
                    price: parseInt(req.body.price),
                    img: "",
                    imgID: "",
                    //time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${minutes} ${timeOfDay}`,
                    timeID: time.getTime()
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
   - title (String, optional): Title of new listing
   - desc (String, optional): Optional description of new listing
   - location (String, optional): Location of new listing
   - phoneNumber (String, optional): Phone number of seller in form (xxx)-xxx-xxxx
   - price (Number, optional): Price of listing
   - img (File, optional): Image of listing
   - imgUpdated (Boolean, required): Regarding whether the listing image is being
  updated

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  =================================
*/
// app.post("/edit_listing", formParser, listingValidator, imgValidator, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).send({ msg: "Invalid user (auth/invalid-user)" });
//     }

//     const listingRef = doc(db, "listings", req.body.listing);
//     const listingSnapshot = await getDoc(listingRef);

//     if (listingSnapshot.data()) {
//         if (user.email === listingSnapshot.data().user) {
//             const update = genListingUpdate(listingSnapshot.data(), req);

//             if (req.body.imgUpdate == "true") {
//                 const oldImgID = listingSnapshot.data().imgID;

//                 const timeID = new Date().getTime();
//                 const imgID = `${user.email}+${req.body.title}+${timeID}`;
//                 const imgRef = ref(storage, `images/${oldImgID}`);

//                 try {
//                     if (req.body.img) {
//                         const storageRef = ref(storage, `images/${imgID}`);

//                         const metadata = {
//                             contentType: "img/jpeg"
//                         }

//                         const uploadTask = uploadBytesResumable(storageRef, req.body.img, metadata);

//                         uploadTask.on('state_changed', (snapshot) => {}, (err) => {
//                             res.status(400).json({ msg: err.message });
//                         }, async () => {
//                             deleteObject(imgRef);

//                             update.img = await getDownloadURL(uploadTask.snapshot.ref);
//                             update.imgID = imgID;
//                             update.timeID = timeID;
//                         });
//                     } else {
//                         deleteObject(imgRef);

//                         if (listingSnapshot.data().img != update.img) {
//                             update.img = "";
//                             update.imgID = "";
//                         }
//                     }
//                 } catch (err) {
//                     res.status(400).json({ msg: err.message });
//                 }
//             }

//             try {
//                 if (Object.keys(update).length != 0) {
//                     await updateDoc(listingRef, update);
//                 }
//                 res.status(200).json({ msg: "Listing updated" });
//             } catch (err) {
//                 res.status(400).json({ msg: err.message });
//             }
//         } else {
//             res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
//         }
//     } else {
//         res.status(400).json({ msg: "Invalid listing" });
//     }
// });

/*
  ========== DELETE /delete_listing ==========
  DESC: Delete a current sell listing

  PARAMETERS:
   - listing (String, required): The id of the desired listing to delete

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ============================================
*/
// app.post("/delete_listing", formParser, async (req, res) => {
//     const user = auth.currentUser;

//     if(!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)"});
//     }

//     const listingRef = doc(db, "listings", req.body.listing);
//     const listingSnapshot = await getDoc(listingRef);

//     if (listingSnapshot.data()) {
//         if (user.email === listingSnapshot.data().user) {
//             try {
//                 await deleteDoc(listingRef);
//                 res.status(200).json({ msg: "Listing deleted" });
//             } catch (err) {
//                 res.status(400).json({ msg: err.message });
//             }
//         } else {
//             res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
//         }
//     } else {
//         res.status(400).json({ msg: "Invalid listing" });
//     }
// });

// ========================== REQUESTS ==========================

/*
  ========== POST /create_request ==========
  DESC: Create a new request for an item

  PARAMETERS:
   - title (String, required): Title of request
   - desc (String, required): Description of item request

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ==========================================
*/
// app.post("/create_request", formParser, requestValidator, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
//     }

//     const time = new Date();
//     let hour = time.getHours();
//     let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : `${time.getMinutes()}`;
//     let timeOfDay = "AM";
//     if (hour > 12) {
//         timeOfDay = "PM";
//         hour -= 12;
//     }

//     try {
//         await addDoc(collection(db, "requests"), {
//             title: req.body.title,
//             desc: req.body.desc,
//             email: user.email,
//             //time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${minutes} ${timeOfDay}`,
//             timeId: time.getTime()
//         });

//         res.status(200).json({ msg: "Request created" });
//     } catch(err) {
//         res.status(400).json({ msg: err.message })
//     }
// });

/*
  ========== POST /edit_request ==========
  DESC: Edit a current buy request

  PARAMETERS:
   - title (String, optional): New title of request
   - desc (String, optional): New description of request

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  =================================
*/
// app.post("/edit_request", formParser, requestValidator, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invaild user (auth/invalid-user"});
//     }

//     const requestRef = doc(db, "requests", req.body.request);
//     const requestSnapshot = await getDoc(requestRef);

//     if (requestSnapshot.data()) {
//         if (user.email == requestSnapshot.data().user) {
//             const update = genRequestUpdate(requestSnapshot.data(), req);

//             try {
//                 await updateDoc(requestRef, update);
//                 res.status(200).json({ msg: "Request updated" });
//             } catch (err) {
//                 res.status(400).json({ msg: err.message });
//             }
//         } else {
//             res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
//         }
//     } else {
//         res.status(400).json({ msg: "Invalid request" });
//     }
// });

/*
  ========== POST /delete_request ==========
  DESC: Delete a current item request

  RETURNS:
  status:
   - 200: success
   - 400: failure

  msg: Message relating to request status
  ==========================================
*/
// app.post("/delete_request", formParser, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).json({ msg: "Invalid user (auth/invalid-user)" });
//     }

//     const requestRef = doc(db, "requests", req.body.request);
//     const requestSnapshot = await getDoc(requestRef);

//     if (requestSnapshot.data()) {
//         if (user.email === requestSnapshot.data().email) {
//             try {
//                 await deleteDoc(requestRef);
//                 res.status(200).json({ msg: "Request deleted" });
//             } catch(err) {
//                 res.status(400).json({ msg: err.message });
//             }
//         } else {
//             res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
//         }
//     } else {
//         res.status(400).json({ msg: "Invalid listing" });
//     }
// });

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

app.get("/create_listing", (req, res) => {
    res.render("pages/create_post");
});
app.get("/terms", (req, res) => {
    res.render("pages/terms_and_conditions");
});

// TEST ROUTES

app.get("/login_test", (req, res) => {
    res.render("pages/TEST_PAGES/test_login");
});

app.get("/create_listing_test", (req, res) => {
    res.render("pages/TEST_PAGES/test");
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

    if (req.body.location != undefined && (data.location != req.body.location)) {
        update.location = req.body.location;
    }

    if (req.body.phoneNumber != undefined && (data.phoneNumber != req.body.phoneNumber)) {
        update.phoneNumber = req.body.phoneNumber;
    }

    if (req.body.price != undefined && (data.price != req.body.price)) {
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

    if (req.body.title != undefined && (data.title != req.body.title)) {
        update.title = req.body.title;
    }

    if (req.body.desc != undefined && (data.desc != req.body.desc)) {
        update.desc = req.body.desc;
    }

    return update;
}

module.exports = app;
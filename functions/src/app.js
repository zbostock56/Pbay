const { initializeApp } = require("firebase/app");
const { getFirestore, connectFirestoreEmulator, collection, addDoc, doc, onSnapshot, setDoc, updateDoc, getDoc, deleteDoc } = require("firebase/firestore");
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
connectFirestoreEmulator(db, "127.0.0.1", 8081);
connectStorageEmulator(storage, "localhost", 9199);

const express = require("express");
const formParser = require("./form-parser");
const listingValidator = require("./listing-validator");
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
        tags: "this is a tag!"
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
        tag: "here is the story of a man who once was large"
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
        tags: "This is a tag"
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
        tags: "This is the best thing in the world"
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
        tags: "Please help me"
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
        tags: "Yes!"
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
        tags: "crypto currency"
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
        tags: "crypto currency"
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
        tags: "Hello world"
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
        tags: "Consumer Goods"
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
        tags: "Fuck me!"
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
        tags: "Test"
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

/*
  ========== POST /create_listing ==========
  DESC: Create a new sell listing

  PARAMETERS:
  title (String, required): Title of new listing
  desc (String, required): Optional description of new listing
  location (String, required): Location of new listing
  phoneNumber (String, required): Phone number of seller in form (xxx)-xxx-xxxx
  price (Number, required): Price of listing
  img (File, optional): Image of listing item

  RETURNS:
  status:
   - 200: success
   - 400: failture
  =================================
*/
app.post("/create_listing", formParser, listingValidator, async (req, res) => {
    // Grab current user
    const user = auth.currentUser;

    // Ensure user is logged in
    if (!user) {
        res.status(400).json({  msg: "Invalid user (auth/invalid-user)" });
    }

    // Calculate timestamp info
    const time = new Date();
    let hour = time.getHours();
    let timeOfDay = "AM";
    if (time.getHours() > 12) {
        timeOfDay = "PM";
        hour -= 12;
    }

    // Create image id in the form {EMAIL}+{IMAGE_TITLE}+{TIME}
    const imgID = `${user.email}+${req.body.title}+${time.getTime()}`

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
                    user: user.email,
                    title: req.body.title,
                    desc: req.body.desc,
                    location: req.body.location,
                    phoneNumber: req.body.phoneNumber,
                    price: parseInt(req.body.price),
                    img: imgUrl,
                    imgID: imgID,
                    time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${time.getMinutes()} ${timeOfDay}`
                });
            });
        } else {
            // If no image has been uploaded, add a listing without an image
            await addDoc(collection(db, "listings"), {
                user: user.email,
                title: req.body.title,
                desc: req.body.desc,
                location: req.body.location,
                phoneNumber: req.body.phoneNumber,
                price: parseInt(req.body.price),
                img: "",
                imgID: "",
                time: `${time.getMonth()}/${time.getDate()}/${time.getFullYear()} ${hour}:${time.getMinutes()} ${timeOfDay}`
            });
        }

        // Send success message
        res.status(200).json({ msg: "Listing created" });
    } catch (err) {
        // Send error message on error
        res.status(400).json({ msg: err.message });   
    }
});

app.get("/create_listing", (req, res) => {
    res.render("pages/test");
});

/*
  ========== POST /edit_listing ==========
  DESC: Edit a current sell listing

  PARAMETERS:
  title (String, optional): Title of new listing
  desc (String, optional): Optional description of new listing
  location (String, optional): Location of new listing
  phoneNumber (String, optional): Phone number of seller in form (xxx)-xxx-xxxx
  price (Number, optional): Price of listing
  img (File, optional): Image of listing item

  RETURNS:
  status:
   - 200: success
   - 400: failture
  =================================
*/
// app.post("/edit_listing", formParser, listingValidator, async (req, res) => {
//     const user = auth.currentUser;

//     if (!user) {
//         res.status(400).send({ msg: "Invalid user (auth/invalid-user)"});
//     }

//     const listingRef = doc(db, "listings", req.body.listing);

//     await updateDoc(listingRef, {

//     });
// });

/*
  ========== DELETE /delete_listing ==========
  DESC: Delete a current sell listing

  PARAMETERS:
  listing (String, required): The id of the desired listing to delete

  RETURNS:
  status:
   - 200: success
   - 400: failture
  =================================
*/
app.post("/delete_listing", formParser, async (req, res) => {
    const user = auth.currentUser;

    if(!user) {
        res.status(400).json({ msg: "Invalid user (auth/invalid-user)"});
    }

    const listingRef = doc(db, "listings", req.body.listing);
    const listingSnapshot = await getDoc(listingRef);

    if (listingSnapshot.data()) {
        if (user.email === listingSnapshot.data().user) {
            try {
                await deleteDoc(listingRef);
                res.status(200).json({ msg: "Listing deleted" });
            } catch (err) {
                res.status(400).json({ msg: err.message });
            }
        } else {
            res.status(400).json({ msg: "Permission denied (auth/permission-denied)" });
        }
        res.status(200).json({ msg: listingSnapshot.data() });
    } else {
        res.status(400).json({ msg: "Invalid listing" });
    }
});

// ================== CHAT ==================



// ================ ROUTING =================

app.get("/home", (req, res) => {
    res.render("pages/index", { listings: listings });
});

module.exports = app;
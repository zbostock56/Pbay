const { initializeApp } = require("firebase/app");
const { getFirestore, connectFirestoreEmulator } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, connectAuthEmulator } = require("firebase/auth");

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

connectAuthEmulator(auth, "http://localhost:9099");
//connectFirestoreEmulator(db, 'localhost', 4000);

const express = require("express");
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

app.post("/signup", (req, res) => {
    createUserWithEmailAndPassword(auth, req.body.email, req.body.password).then((cred) => {
        res.status(200).json({ user: cred.user });
    }).catch((err) => {
        res.status(400).json({ code: err.code, msg: err.message });
    });
});

app.post("/login", (req, res) => {
    signInWithEmailAndPassword(auth, req.body.email, req.body.password).then((cred) => {
        res.status(200).json({ user: cred.user });
    }).catch((err) => {
        res.status(400).json({ code: err.code, msg: err.message });
    });
});

// app.post("/item", (req, res) => {

// });

app.get("/", (req, res) => {
    res.render("pages/index", { listings: listings });
});

module.exports = app;
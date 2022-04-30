import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { OAuthProvider, getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js"

const firebaseConfig = {
    apiKey: "AIzaSyBtuKD3x-8ggb5UoZsuX4MF-qQhoIMK0_k",
    authDomain: "pbay-51219.firebaseapp.com",
    projectId: "pbay-51219",
    storageBucket: "pbay-51219.appspot.com",
    messagingSenderId: "825090402653",
    appId: "1:825090402653:web:33cf280f3e6c071bbe20b4",
    measurementId: "G-F5FKK2C9M4"
};

//connectAuthEmulator(auth, "http://127.0.0.1:9099");

const fb = initializeApp(firebaseConfig);

const signIn = async () => {
    const auth = getAuth(fb);

    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
        tenant: "purdue.edu"
    });

    signInWithRedirect(auth, provider);
}

const checkRedirect = async () => {
    const auth = getAuth(fb);

    console.log(auth);

    await getRedirectResult(auth)
    .then((result) => {
        if (result) {
            const credential = OAuthProvider.credentialFromResult(result);
            console.log(credential);

            console.log(auth.currentUser.getIdToken());
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

const createListing = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken, 
            title: document.getElementById("title").value,
            desc: document.getElementById("desc").value,
            location: document.getElementById("location").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            price: document.getElementById("price").value,
            img: document.getElementById("img").files[0]
        };
        
        axios.post("http://localhost:3000/create_listing", data, {
            headers: {
                "Content-Type" : "multipart/form-data"
            }
        })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

checkRedirect();

if (document.getElementById("tester")) {
    document.getElementById("tester").addEventListener("click", signIn);
}

if (document.getElementById("submit")) {
    document.getElementById("submit").addEventListener("click", createListing);
}
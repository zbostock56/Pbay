import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { OAuthProvider, getAuth, signInWithRedirect, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js"

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
const auth = getAuth(fb);

//connectAuthEmulator(auth, "http://127.0.0.1:9099");

const provider = new OAuthProvider('microsoft.com');
provider.setCustomParameters({
    tenant: "purdue.edu"
});

function signIn() {
    signInWithRedirect(auth, provider)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });
}

document.getElementById("tester").addEventListener("click", signIn);
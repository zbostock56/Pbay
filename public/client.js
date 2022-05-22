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

const fb = initializeApp(firebaseConfig);
let socket = undefined;
let target = undefined;
const messages = [];

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

    await getRedirectResult(auth)
    .then((result) => {
        if (result) {
            return true;
        }
    })
    .catch((err) => {
        return false;
    });
}

const createListing = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken, 
            title: document.getElementById("title").value,
            desc: document.getElementById("description").value,
            category: document.getElementById("category").value,
            // location: document.getElementById("location").value,
            // phoneNumber: document.getElementById("phoneNumber").value,
            price: document.getElementById("Price-Input").value,
            img: document.getElementById("img").files[0]
        };

        console.log(data);
        
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

const editListing = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken,
            listing: document.getElementById("listing").value,
            title: document.getElementById("title").value,
            desc: document.getElementById("desc").value,
            location: document.getElementById("location").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            price: document.getElementById("price").value,
            img: document.getElementById("img").files[0]
        };

        axios.post("http://localhost:3000/edit_listing", data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

const deleteListing = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken,
            listing: document.getElementById("listing").value
        };

        axios.post("http://localhost:3000/delete_listing", data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });
    })
    .catch((err) => {
        console.log(err);
    });
}

const createRequest = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken,
            title: document.getElementById("title").value,
            desc: document.getElementById("desc").value
        }

        axios.post("http://localhost:3000/create_request", data, {
            headers: {
                "Content-Type": "multipart/form-data"
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

const editRequest = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        const data = {
            idToken: idToken,
            request: document.getElementById("request").value,
            title: document.getElementById("title").value,
            desc: document.getElementById("desc").value
        }

        axios.post("http://localhost:3000/edit_request", data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        })
    })
    .catch((err) => {
        console.log(err);
    });
}

const deleteRequest = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
        .then((idToken) => {
            const data = {
                idToken: idToken,
                request: document.getElementById("request").value
            };

            axios.post("http://localhost:3000/delete_request", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((res) => {
                console.log(res);
            }).catch((err) => {
                console.log(err);
            });
        })
        .catch((err) => {
            console.log(err);
        });
}

const connectSocket = () => {
    if (document.getElementById("target").value != "") {
        socket = io();
        target = document.getElementById("target").value;
    
        const auth = getAuth(fb);
        auth.currentUser.getIdToken()
        .then((idToken) => {
            socket.emit("validate", idToken);
    
            axios({
                method: "get",
                url: `http://localhost:3000/unread_messages/${idToken}/${target}`
            })
            .then((res) => {
                res.data.unread.forEach((msg) => {
                    messages.push(msg);
                });
                populateMessages();
            });
    
            socket.on("message", (message) => {
                if (message.target == auth.currentUser.uid) {
                    messages.push(message);
                    populateMessages();
                }
            });
        })
        .catch((err) => {
            console.log(err);
        });
    }
}

const sendMessage = () => {
    if (target) {
        socket.emit("message", target, document.getElementById("message").value);
    } else {
        console.log("no target");
    }
}

const populateMessages = () => {
    const list = document.getElementById("messages");

    messages.forEach((message) => {
        if (!document.getElementById(message.time)) {
            const item = document.createElement("li");
            item.setAttribute("id", message.time);
            item.appendChild(document.createTextNode(`[${message.time}] ${message.msg}`));
            list.appendChild(item);
        }
    });
}

if (document.getElementById("login")) {
    document.getElementById("login-button").addEventListener("click", signIn);

    if (checkRedirect()) {
        window.location = "/home";
    }
}

if (document.getElementById("create-listing")) {
    if (checkRedirect()) {
        document.getElementById("submit_listing").addEventListener("click", createListing);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("submit_edit")) {
    if (checkRedirect()) {
        document.getElementById("submit_edit").addEventListener("click", editListing);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("delete_listing")) {
    if (checkRedirect()) {
        document.getElementById("delete_listing").addEventListener("click", deleteListing);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("submit_request")) {
    if (checkRedirect()) {
        document.getElementById("submit_request").addEventListener("click", createRequest);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("edit_request")) {
    if (checkRedirect()) {
        document.getElementById("edit_request").addEventListener("click", editRequest);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("delete_request")) {
    if (checkRedirect()) {
        document.getElementById("delete_request").addEventListener("click", deleteRequest);
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("socket-connect")) {
    document.getElementById("socket-connect").addEventListener("click", connectSocket);
    document.getElementById("send_msg").addEventListener("click", sendMessage);
}
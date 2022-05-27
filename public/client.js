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
        if (document.getElementById("agreeToTermsAndConditions").checked) {
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
            
            axios.post("http://localhost:3000/create_listing", data, {
                headers: {
                    "Content-Type" : "multipart/form-data"
                }
            })
            .then((res) => {
                window.location = "/home";
            })
            .catch(async (err) => {
                const res = await JSON.parse(err.response.request.response);
                let error = "";
                for (const msg in res.msg) {
                    error = `${error} ${res.msg[msg]},`;
                }
                error = error.substring(0, error.length - 1);
                document.getElementById("err-txt").innerHTML = error;
            });
        } else {
            document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

const editListing = () => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (document.getElementById("agreeToTermsAndConditions").checked) {
                const idToken = await user.getIdToken();
                const path = window.location.pathname;
                const listing = path.substring(31);

                const data = {
                    idToken: idToken,
                    listing: listing
                };

                if (document.getElementById("title").value != "") {
                    data.title = document.getElementById("title").value;
                }

                if (document.getElementById("delete-desc").checked) {
                    data.desc = "";
                } else if (document.getElementById("description").value != "") {
                    data.desc = document.getElementById("description").value;
                }

                if (parseInt(document.getElementById("category").value) >= 1 && parseInt(document.getElementById("category").value) <= 19) {
                    data.category = document.getElementById("category").value;
                }

                if (document.getElementById("make-free").checked) {
                    data.price = "0.0";
                } else if (document.getElementById("Price-Input").value != "") {
                    data.price = document.getElementById("Price-Input").value;
                }

                if (document.getElementById("delete-img").checked) {
                    data.updateImg = "1";
                } else if (document.getElementById("file-input").files[0]) {
                    data.updateImg = "1";
                    data.img = document.getElementById("file-input").files[0];
                } else {
                    data.updateImg = "0";
                }

                axios.post("http://localhost:3000/edit_listing", data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                    window.location = `/home/my_postings/${idToken}`;
                }).catch(async (err) => {
                    const res = await JSON.parse(err.response.request.response);
                    let error = "";
                    for (const msg in res.msg) {
                        error = `${error} ${res.msg[msg]},`;
                    }
                    error = error.substring(0, error.length - 1);
                    document.getElementById("err-txt").innerHTML = error;
                });
            } else {
                document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
            }
        } else {
            window.location = "/login";
        }
    });
}

const deleteListing = (id) => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const idToken = await user.getIdToken();

            const data = {
                idToken: idToken,
                listing: id
            };
    
            axios.post("http://localhost:3000/delete_listing", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((res) => {
                location.reload();
            }).catch((err) => {
                console.log(err);
            });
        } else {
            window.location = "/login";
        }
    })
}

const createRequest = () => {
    const auth = getAuth(fb);

    auth.currentUser.getIdToken()
    .then((idToken) => {
        if (document.getElementById("agreeToTermsAndConditions").checked) {
            const data = {
                idToken: idToken,
                title: document.getElementById("title").value,
                desc: document.getElementById("description").value,
                category: document.getElementById("category").value
            }

            axios.post("http://localhost:3000/create_request", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            .then((res) => {
                window.location = "/home";
            })
            .catch(async (err) => {
                const res = await JSON.parse(err.response.request.response);
                let error = "";
                for (const msg in res.msg) {
                    error = `${error} ${res.msg[msg]},`;
                }
                error = error.substring(0, error.length - 1);
                document.getElementById("err-txt").innerHTML = error;
            });
        } else {
            document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

const editRequest = () => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (document.getElementById("agreeToTermsAndConditions").checked) {
                const idToken = await user.getIdToken();
                const path = window.location.pathname;
                const request = path.substring(31);

                const data = {
                    idToken: idToken,
                    request: request
                };

                if (document.getElementById("title").value != "") {
                    data.title = document.getElementById("title").value;
                }

                if (document.getElementById("delete-desc").checked) {
                    data.desc = "";
                } else if (document.getElementById("description").value != "") {
                    data.desc = document.getElementById("description").value;
                }

                if (parseInt(document.getElementById("category").value) >= 1 && parseInt(document.getElementById("category").value) <= 19) {
                    data.category = document.getElementById("category").value;
                }
                
                console.log(data);
        
                axios.post("http://localhost:3000/edit_request", data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                    window.location = `/home/my_postings/${idToken}`;
                }).catch(async (err) => {
                    console.log(err);
                    const res = await JSON.parse(err.response.request.response);
                    let error = "";
                    for (const msg in res.msg) {
                        error = `${error} ${res.msg[msg]},`;
                    }
                    error = error.substring(0, error.length - 1);
                    document.getElementById("err-txt").innerHTML = error;
                });
            } else {
                document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
            }
        } else {
            window.location = "/login";
        }
    });
}

const deleteRequest = (id) => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const idToken = await user.getIdToken();

            const data = {
                idToken: idToken,
                request: id
            };
    
            axios.post("http://localhost:3000/delete_request", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then((res) => {
                location.reload();
            }).catch((err) => {
                console.log(err);
            });
        } else {
            window.location = "/login";
        }
    })
}

const viewMessagesRedirect = async () => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            window.location = `/messages/${await user.getIdToken()}`
        } else {
            window.location = "/login";
        }
    });
}

const viewPostsRedirect = async () => {
    const auth = getAuth(fb);

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            window.location = `/home/my_postings/${await user.getIdToken()}`
        } else {
            window.location = "/login";
        }
    });
}

const connectSocket = (target) => {
    socket = io();

    const auth = getAuth(fb);
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const idToken = await user.getIdToken();
            socket.emit("validate", { target: target, idToken: idToken});

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
        } else {
            window.location = "/login";
        }
    });
}

const populateMessages = () => {
    const list = document.getElementById("messages");

    messages.forEach((message) => {
        if (!document.getElementById(message.time)) {
            const msg = document.createElement("div");
            msg.setAttribute("id", message.time);
            msg.classList.add("card", "rounded-3", "shadow", "border-dark", "mb-3");
            msg.style.width = "50vw";

            const msg_head = document.createElement("div");
            msg_head.classList.add("card-header");
            msg_head.style.fontWeight = "bold";
            msg_head.style.fontSize = "large";
            msg_head.style.whiteSpace = "nowrap";
            msg_head.style.fontSize = "larger";
            
            const msg_title = document.createElement("div");
            msg_title.classList.add("card-title", "text-wrap");
            msg_title.appendChild(document.createTextNode(message.from));

            const msg_body = document.createElement("div");
            msg_body.classList.add("card-body", "text-wrap");
            msg_body.appendChild(document.createTextNode(message.msg));

            const msg_footer = document.createElement("div");
            msg_footer.classList.add("card-footer");

            msg_head.appendChild(msg_title);
            msg_head.appendChild(msg_body);
            msg_head.appendChild(msg_footer);

            msg.appendChild(msg_head);

            list.appendChild(msg);
        }
    });
}

if (document.getElementById("view-messages")) {
    document.getElementById("view-messages").addEventListener("click", viewMessagesRedirect);
}

if (document.getElementById("view-posts")) {
    document.getElementById("view-posts").addEventListener("click", viewPostsRedirect);
}

if (document.getElementById("login")) {
    document.getElementById("login-button").addEventListener("click", signIn);

    if (checkRedirect()) {
        window.location = "/home";
    }
}

if (document.getElementById("submit_listing")) {
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

if (document.getElementsByClassName("delete_listing").length > 0) {
    if (checkRedirect()) {
        Array.from(document.getElementsByClassName("delete_listing")).forEach((listing) => {
            listing.addEventListener("click", () => { deleteListing(listing.id) });
        });
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

if (document.getElementsByClassName("delete_request").length > 0) {
    if (checkRedirect()) {
        Array.from(document.getElementsByClassName("delete_request")).forEach((request) => {
            request.addEventListener("click", () => { deleteRequest(request.id) });
        });
    } else {
        window.location = "/login";
    }
}

if (document.getElementById("chat")) {
    const path = window.location.pathname;
    const target = path.substring(6);

    connectSocket(target);

    document.getElementById("send-msg").addEventListener("click", () => {
        socket.emit("message", target, document.getElementById("msg-body").value);
    });
}
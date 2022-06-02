import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { OAuthProvider, getAuth, signInWithRedirect, signOut, connectAuthEmulator } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js"

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

//let connected = false;

let socket = undefined;
const messages = [];

const signIn = async () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    const provider = new OAuthProvider('microsoft.com');
    provider.setCustomParameters({
        tenant: "purdue.edu"
    });

    signInWithRedirect(auth, provider);
}

const createListing = () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const idToken = await user.getIdToken();

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
                        "Content-Type": "multipart/form-data"
                    }
                })
                    .then((res) => {
                        window.location = `/home/my_postings/${idToken}?status=lc_success`;
                    })
                    .catch(async (err) => {
                        const res = await JSON.parse(err.response.request.response);
                        document.getElementById("err-txt").innerHTML = res.msg;
                    });
            } else {
                document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
            }
        } else {
            window.location = "/login";
        }
    });
}

const editListing = () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
                    window.location = `/home/my_postings/${idToken}?status=le_success`;
                }).catch(async (err) => {
                    const res = await JSON.parse(err.response.request.response);
                    document.getElementById("err-txt").innerHTML = res.msg;
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
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
                window.location = `/home/my_postings/${idToken}?status=ld_success`;
            }).catch((err) => {
                window.location = `/home/my_postings/${idToken}?status=ld_fail`;
            });
        } else {
            window.location = "/login";
        }
    })
}

const createRequest = () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const idToken = await user.getIdToken();

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
                        window.location = `/home/my_postings/${idToken}?status=rc_success`;
                    })
                    .catch(async (err) => {
                        const res = await JSON.parse(err.response.request.response);
                        document.getElementById("err-txt").innerHTML = res.msg;
                    });
            } else {
                document.getElementById("err-txt").innerHTML = "You must accept the terms and conditions before creating posts";
            }
        } else {
            window.location = "/login";
        }
    });
}

const editRequest = () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
        
                axios.post("http://localhost:3000/edit_request", data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                    window.location = `/home/my_postings/${idToken}?status=re_success`;
                }).catch(async (err) => {
                    const res = await JSON.parse(err.response.request.response);
                    document.getElementById("err-txt").innerHTML = res.msg;
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
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
                window.location = `/home/my_postings/${idToken}?status=rd_success`;
            }).catch((err) => {
                window.location = `/home/my_postings/${idToken}?status=rd_fail`;
            });
        } else {
            window.location = "/login";
        }
    })
}

const viewMessagesRedirect = async () => {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

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
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }
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
            })
            .catch((err) => {
                console.log(err);
                if (err) {
                    if (document.getElementById("err-msg")) {
                        document.getElementById("err-msg").innerHTML = err.msg;
                    }
                }
            });

            socket.on("message", (message) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerHTML = "";
                }

                if (message.target == auth.currentUser.uid) {
                    messages.push(message);
                    populateMessages();
                }
            });

            socket.on("ping", (message) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerHTML = "";
                }

                if (message.from === auth.currentUser.uid) {
                    messages.push(message);
                    populateMessages();
                }
            });

            socket.on("error", (err) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerHTML = err.msg;
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
            msg.style.overflowWrap = "break-word";

            const from = document.createElement("h6");
            from.classList.add("mb-0");
            from.innerHTML = message.from_name;

            const text = document.createElement("p");
            text.innerHTML = message.msg;

            msg.appendChild(from);
            msg.appendChild(text);

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

if (document.getElementById("loginLogout")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("loginLogout").innerHTML = "Logout";
            document.getElementById("loginLogout").addEventListener("click", () => {
                signOut(auth).then(() => {
                    window.location = "/home";
                })
                .catch((err) => {
                    window.location = "/home"
                });
            });
        } else {
            document.getElementById("loginLogout").innerHTML = "Login";
            document.getElementById("loginLogout").addEventListener("click", () => {
                window.location = "/login";
            });
        }
    })
}

if (document.getElementById("login")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            window.location = "/home";
        } else {
            document.getElementById("login-button").addEventListener("click", signIn);
        }
    });
}

if (document.getElementById("filter_menu")) {
    const both = document.getElementById("both");
    const listing_only = document.getElementById("listing_only");
    const request_only = document.getElementById("request_only");

    const listing_display = document.getElementById("listing_display");
    const request_display = document.getElementById("request_display");

    both.addEventListener("click", () => {
        both.classList.add("active");
        listing_only.classList.remove("active");
        request_only.classList.remove("active");

        listing_display.style.display="block";
        request_display.style.display="block";
    });

    listing_only.addEventListener("click", () => {
        listing_only.classList.add("active");
        both.classList.remove("active");
        request_only.classList.remove("active");

        listing_display.style.display = "block";
        request_display.style.display = "none";
    });

    request_only.addEventListener("click", () => {
        request_only.classList.add("active");
        listing_only.classList.remove("active");
        both.classList.remove("active");

        listing_display.style.display = "none";
        request_display.style.display = "block";
    })
}

if (document.getElementById("submit_listing")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("submit_listing").addEventListener("click", createListing);
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementById("submit_edit")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("submit_edit").addEventListener("click", editListing);
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementById("delete_listing")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("delete_listing").addEventListener("click", deleteListing);
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementsByClassName("delete_listing").length > 0) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            Array.from(document.getElementsByClassName("delete_listing")).forEach((listing) => {
                listing.addEventListener("click", () => { deleteListing(listing.id) });
            });
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementById("submit_request")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("submit_request").addEventListener("click", createRequest);
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementById("edit_request")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById("edit_request").addEventListener("click", editRequest);
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementsByClassName("delete_request").length > 0) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged((user) => {
        if (user) {
            Array.from(document.getElementsByClassName("delete_request")).forEach((request) => {
                request.addEventListener("click", () => { deleteRequest(request.id) });
            });
        } else {
            window.location = "/login";
        }
    });
}

if (document.getElementById("chat")) {
    const path = window.location.pathname;
    const target = path.substring(6);

    connectSocket(target);

    document.getElementById("send-msg").addEventListener("click", () => {
        socket.emit("message", target, document.getElementById("msg-body").value);
    });
}
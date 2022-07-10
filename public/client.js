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

// const DOMAIN = "https://www.pbayshop.com";
const DOMAIN = "http://localhost:3000";

let nextSearchIndex = 0;
let nextListingIndex = 0;
let nextRequestIndex = 0;

const listingBuffer = [];
const requestBuffer = [];

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
                    //img: document.getElementById("img").files
                };

                const files = document.getElementById("img").files;
                for (let i = 0; i < files.length; i++) {
                    data[i] = files[i];
                }

                axios.post(`${DOMAIN}/create_listing`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                    .then((res) => {
                        window.location = `/home/my_postings/${idToken}?status=lc_success`;
                    })
                    .catch(async (err) => {
                        let res = {}
                        if (err.response.status === 413) { 
                            res = { msg: "Image cannot exceed 2MB" };
                        } else {
                            res = await JSON.parse(err.response.request.response);
                        }
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
                    const files = document.getElementById("file-input").files;
                    for (let i = 0; i < files.length; i++) {
                        data[i] = files[i];
                    }
                    data.updateImg = "1";
                } else {
                    data.updateImg = "0";
                }

                axios.post(`${DOMAIN}/edit_listing`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                    window.location = `/home/my_postings/${idToken}?status=le_success`;
                }).catch(async (err) => {
                    let res = {}
                    if (err.response.status === 413) { 
                        res = { msg: "Image cannot exceed 2MB" };
                    } else {
                        res = await JSON.parse(err.response.request.response);
                    }
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
    
            axios.post(`${DOMAIN}/delete_listing`, data, {
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

                axios.post(`${DOMAIN}/create_request`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                    .then((res) => {
                        window.location = `/home/my_postings/${idToken}?status=rc_success`;
                    })
                    .catch(async (err) => {
                        let res = {}
                        if (err.response.status === 413) { 
                            res = { msg: "Image cannot exceed 2MB" };
                        } else {
                            res = await JSON.parse(err.response.request.response);
                        }
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
        
                axios.post(`${DOMAIN}/edit_request`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res) => {
                    window.location = `/home/my_postings/${idToken}?status=re_success`;
                }).catch(async (err) => {
                    let res = {}
                    if (err.response.status === 413) { 
                        res = { msg: "Image cannot exceed 2MB" };
                    } else {
                        res = await JSON.parse(err.response.request.response);
                    }
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
    
            axios.post(`${DOMAIN}/delete_request`, data, {
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
                url: `${DOMAIN}/unread_messages/${idToken}/${target}`
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

        document.getElementById("search-bar").value = "";
    });

    listing_only.addEventListener("click", () => {
        listing_only.classList.add("active");
        both.classList.remove("active");
        request_only.classList.remove("active");

        listing_display.style.display = "block";
        request_display.style.display = "none";

        document.getElementById("search-bar").value = "";
    });

    request_only.addEventListener("click", () => {
        request_only.classList.add("active");
        listing_only.classList.remove("active");
        both.classList.remove("active");

        listing_display.style.display = "none";
        request_display.style.display = "block";

        document.getElementById("search-bar").value = "";
    })

    let prev = "";
    setInterval(async () => {
        if (document.getElementById("search-list").classList.contains("invisible")) {
            document.getElementById("search-list").classList.remove("invisible");
        }

        const query = document.getElementById("search-bar").value.toLowerCase();
        if (query !== prev) {
            const list = document.getElementById("search-list");
            if (query !== "") {
                while (list.lastChild) {
                    list.removeChild(list.lastChild);
                }

                let listingCount = 0;
                for (let i = 0; i < listingBuffer.length; i++) {
                    if (listingBuffer[i].title.toLowerCase().includes(query)) {
                        list.innerHTML += `<a href="#card_${listingBuffer[i].id}" class="list-group-item list-group-item-action">Listings - ${listingBuffer[i].title} - ${listingBuffer[i].category}</a>`;
                        listingCount++;
                    }

                    if (listingCount === 5) {
                        break;
                    }
                }

                let requestCount = 0;
                for (let i = 0; i < requestBuffer.length; i++) {
                    if (requestBuffer[i].title.toLowerCase().includes(query)) {
                        list.innerHTML += `<a href="#card_${requestBuffer[i].id}" class="list-group-item list-group-item-action">Requests - ${requestBuffer[i].title} - ${requestBuffer[i].category}</a>`;
                        requestCount++;
                    }

                    if (requestCount === 5) {
                        break;
                    }
                }
            } else {
                while (list.lastChild) {
                    list.removeChild(list.lastChild);
                }
            }
        }
        prev = query;
    }, 100);

    document.getElementById("load-more").addEventListener("click", async () => {
        console.log("hit");
        if (nextSearchIndex !== -1) {
            const query = document.getElementById("search-bar").value.toLowerCase();
            const list = document.getElementById("search-list");
            
            let queryStr = "?";
            if (document.getElementById("listing_only").classList.contains("active")) {
                queryStr += "type=listings";
            } else if (document.getElementById("request_only").classList.contains("active")) {
                queryStr += "type=requests";
            }
            
            if (document.getElementById("category_page")) {
                if (queryStr === "?") {
                    queryStr += `category=${document.getElementById("listing_display").classList[0]}`;
                } else {
                    queryStr += `&category=${document.getElementById("listing_display").classList[0]}`;
                }
            }

            if (document.getElementById("user_page")) {
                const auth = getAuth(fb);

                await auth.onAuthStateChanged(async (user) => {
                    if (user) {
                        const idToken = await user.getIdToken();

                        axios({
                            method: "get",
                            url: `${DOMAIN}/search_user/${idToken}/${query}/${nextSearchIndex}${queryStr}`
                        })
                        .then((res) => {
                            const nextIndex = res.data.nextIndex;
                            const records = res.data.responses;

                            records.forEach((record) => {
                                list.innerHTML = record + list.innerHTML;
                            });

                            if (nextIndex != -1) {
                                document.getElementById("load-more").style.display = "block";
                                nextSearchIndex = nextIndex;
                            } else {
                                document.getElementById("load-more").style.display = "none";
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            if (err) {
                                if (document.getElementById("err-msg")) {
                                    document.getElementById("err-msg").innerHTML = err.msg;
                                }
                            }
                        });
                    }
                });
            } else {
                axios({
                    method: "get",
                    url: `${DOMAIN}/search/${query}/${nextSearchIndex}${queryStr}`
                })
                .then((res) => {
                    const nextIndex = res.data.nextIndex;
                    const records = res.data.responses;

                    records.forEach((record) => {
                        list.innerHTML = record + list.innerHTML;
                    });

                    if (nextIndex != -1) {
                        document.getElementById("load-more").style.display = "block";
                        nextSearchIndex = nextIndex;
                    } else {
                        document.getElementById("load-more").style.display = "none";
                    }
                })
                .catch((err) => {
                    console.log(err);
                    if (err) {
                        if (document.getElementById("err-msg")) {
                            document.getElementById("err-msg").innerHTML = err.msg;
                        }
                    }
                });
            }
        }
    });
}

if (document.getElementById("home_page") || document.getElementById("category_page") || document.getElementById("user_page")) {
    const auth = getAuth(fb);

    await auth.onAuthStateChanged(async (user) => {
        let routes = [];
        if (document.getElementById("user_page")) {
            if (user) {
                const idToken = await user.getIdToken();
                routes[0] = `user_listings/${idToken}`;
                routes[1] = `user_requests/${idToken}`;
            } else {
                window.location = "/login";
            }
        } else {
            routes[0] = "listings";
            routes[1] = "requests";
        }

        let queryStr = "?";
        if (document.getElementById("category_page")) {
            queryStr += `category=${document.getElementById("listing_display").classList[0]}`;
        }

        const listingList = document.getElementById("cards");
        axios({
            method: "get",
            url: `${DOMAIN}/${routes[0]}/${nextListingIndex}${queryStr}`
        })
        .then((res) => {
            const listings = res.data.listings;
            const nextIndex = res.data.nextIndex;

            listings.forEach((listing) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("col");
                wrapper.style.paddingBottom = "3vh";
                wrapper.innerHTML = listing.html;

                listingList.appendChild(wrapper);

                if (user) {
                    if (document.getElementById(`delete_${listing.id}`)) {
                        document.getElementById(`delete_${listing.id}`).addEventListener("click", () => {
                            deleteListing(listing.id);
                        });
                    }

                    if (document.getElementById(`message_button_${listing.id}`) &&
                        document.getElementById(`message_button_${listing.id}`).classList.contains(`message_${user.uid}`)) {
                        document.getElementById(`message_button_${listing.id}`).style.display = "none";
                    }
                }

                listingBuffer.push({ id: listing.id, title: listing.title, category: listing.category });
            });

            if (listings.length > 0) {
                document.getElementById("no_listings").style.display = "none";
            }

            if (nextIndex === -1) {
                nextListingIndex = -1;
            } else {
                nextListingIndex = nextIndex;
                document.getElementById("load_more_listings").style.display = "block";
            }
        })
        .catch((err) => {
            console.log(err);
            if (err) {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerHTML = err.msg;
                }
            }
        });

        const requestList = document.getElementById("request_cards");
        axios({
            method: "get",
            url: `${DOMAIN}/${routes[1]}/${nextRequestIndex}${queryStr}`
        })
        .then((res) => {
            const requests = res.data.requests;
            const nextIndex = res.data.nextIndex;

            requests.forEach((request) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("col");
                wrapper.style.paddingBottom = "3vh";
                wrapper.innerHTML = request.html;

                requestList.appendChild(wrapper);

                if (user) {
                    if (document.getElementById(`delete_${request.id}`)) {
                        document.getElementById(`delete_${request.id}`).addEventListener("click", () => {
                            deleteRequest(request.id);
                        });
                    }

                    if (document.getElementById(`message_button_${request.id}`) && 
                        document.getElementById(`message_button_${request.id}`).classList.contains(`message_${user.uid}`)) {
                        document.getElementById(`message_button_${request.id}`).style.display = "none";
                    }
                }

                requestBuffer.push({ id: request.id, title: request.title, category: request.category });
            });

            if (requests.length > 0) {
                document.getElementById("no_requests").style.display = "none";
            }

            if (nextIndex === -1) {
                nextRequestIndex = -1;
            } else {
                nextRequestIndex = nextIndex;
                document.getElementById("load_more_requests").style.display = "block";
            }
        })
        .catch((err) => {
            console.log(err);
            if (err) {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerHTML = err.msg;
                }
            }
        });

        document.getElementById("load_more_listings").addEventListener("click", () => {
            if (nextListingIndex !== -1) {
                const listingList = document.getElementById("cards");
                axios({
                    method: "get",
                    url: `${DOMAIN}/${routes[0]}/${nextListingIndex}${queryStr}`
                })
                .then((res) => {
                    const listings = res.data.listings;
                    const nextIndex = res.data.nextIndex;

                    listings.forEach((listing) => {
                        const wrapper = document.createElement("div");
                        wrapper.classList.add("col");
                        wrapper.style.paddingBottom = "3vh";
                        wrapper.innerHTML = listing.html;

                        listingList.appendChild(wrapper);

                        if (user) {
                            if (document.getElementById(`delete_${listing.id}`)) {
                                document.getElementById(`delete_${listing.id}`).addEventListener("click", () => {
                                    deleteListing(listing.id);
                                });
                            }

                            if (document.getElementById(`message_button_${listing.id}`) &&
                                document.getElementById(`message_button_${listing.id}`).classList.contains(`message_${user.uid}`)) {
                                document.getElementById(`message_button_${listing.id}`).style.display = "none";
                            }
                        }

                        listingBuffer.push({ id: listing.id, title: listing.title, category: listing.category });
                    });

                    if (nextIndex === -1) {
                        nextListingIndex = -1;
                        document.getElementById("load_more_listings").style.display = "none";
                    } else {
                        nextListingIndex = nextIndex;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    if (err) {
                        if (document.getElementById("err-msg")) {
                            document.getElementById("err-msg").innerHTML = err.msg;
                        }
                    }
                });
            }
        });

        document.getElementById("load_more_requests").addEventListener("click", () => {
            if (nextRequestIndex !== -1) {
                const requestList = document.getElementById("request_cards");
                axios({
                    method: "get",
                    url: `${DOMAIN}/${routes[1]}/${nextRequestIndex}${queryStr}`
                })
                .then((res) => {
                    const requests = res.data.requests;
                    const nextIndex = res.data.nextIndex;

                    requests.forEach((request) => {
                        const wrapper = document.createElement("div");
                        wrapper.classList.add("col");
                        wrapper.style.paddingBottom = "3vh";
                        wrapper.innerHTML = request.html;

                        requestList.appendChild(wrapper);

                        if (user) {
                            if (document.getElementById(`delete_${request.id}`)) {
                                document.getElementById(`delete_${request.id}`).addEventListener("click", () => {
                                    deleteRequest(request.id);
                                });
                            }

                            if (document.getElementById(`message_button_${request.id}`) && 
                                document.getElementById(`message_button_${request.id}`).classList.contains(`message_${user.uid}`)) {
                                document.getElementById(`message_button_${request.id}`).style.display = "none";
                            }
                        }

                        requestBuffer.push({ id: request.id, title: request.title, category: request.category });
                    });
                    
                    if (nextIndex === -1) {
                        nextRequestIndex = -1;
                        document.getElementById("load_more_requests").style.display = "none";
                    } else {
                        nextRequestIndex = nextIndex;
                    }
                })
                .catch((err) => {
                    console.log(err);
                    if (err) {
                        if (document.getElementById("err-msg")) {
                            document.getElementById("err-msg").innerHTML = err.msg;
                        }
                    }
                });
            }
        });
    });
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

if (document.getElementById("chat")) {
    const path = window.location.pathname;
    const target = path.substring(6);

    connectSocket(target);

    document.getElementById("send-msg").addEventListener("click", () => {
        if (document.getElementById("msg-body").value !== "") {
            socket.emit("message", target, document.getElementById("msg-body").value);
            document.getElementById("msg-body").value = "";
        }
    });

    document.getElementById("msg-body").addEventListener("keydown", (e) => {
        if (e.code === "Enter" && document.getElementById("msg-body").value !== "") {
            socket.emit("message", target, document.getElementById("msg-body").value);
            document.getElementById("msg-body").value = "";
        }
    });
}
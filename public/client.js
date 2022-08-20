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

// let connected = false;

let socket = undefined;
const messages = [];

const DOMAIN = "https://www.pbayshop.com";
// const DOMAIN = "http://localhost:3000";

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
                        document.getElementById("err-txt").innerText = res.msg;
                    });
            } else {
                document.getElementById("err-txt").innerText = "You must accept the terms and conditions before creating posts";
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
                    document.getElementById("err-txt").innerText = res.msg;
                });
            } else {
                document.getElementById("err-txt").innerText = "You must accept the terms and conditions before creating posts";
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
                        document.getElementById("err-txt").innerText = res.msg;
                    });
            } else {
                document.getElementById("err-txt").innerText = "You must accept the terms and conditions before creating posts";
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
                    document.getElementById("err-txt").innerText = res.msg;
                });
            } else {
                document.getElementById("err-txt").innerText = "You must accept the terms and conditions before creating posts";
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
                        document.getElementById("err-msg").innerText = err.msg;
                    }
                }
            });

            socket.on("message", (message) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerText = "";
                }

                if (message.target == auth.currentUser.uid) {
                    messages.push(message);
                    populateMessages();
                }
            });

            socket.on("ping", (message) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerText = "";
                }

                if (message.from === auth.currentUser.uid) {
                    messages.push(message);
                    populateMessages();
                }
            });

            socket.on("error", (err) => {
                if (document.getElementById("err-msg")) {
                    document.getElementById("err-msg").innerText = err.msg;
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
            from.innerText = message.from_name;

            const text = document.createElement("p");
            text.innerText = message.msg;

            msg.appendChild(from);
            msg.appendChild(text);

            list.appendChild(msg);
        }
    });
}

const clearSearchAndPreviews = () => {
    while (document.getElementById("preview_listing").childElementCount > 0) {
        document.getElementById("preview_listing").removeChild(document.getElementById("preview_listing").firstChild);
    }
    while (document.getElementById("preview_request").childElementCount > 0) {
        document.getElementById("preview_request").removeChild(document.getElementById("preview_request").firstChild);
    }
    document.getElementById("search-bar").value = "";
}

const populateUserCard = (user, id, type) => {
    if (user) {
        if (document.getElementById(`delete_${id}`)) {
            document.getElementById(`delete_${id}`).addEventListener("click", () => {
                if (type === "listings") {
                    deleteListing(id);
                } else {
                    deleteRequest(id);
                }
            });
        }

        if (document.getElementById(`message_button_${id}`) &&
            document.getElementById(`message_button_${id}`).classList.contains(`message_${user.uid}`)) {
            document.getElementById(`message_button_${id}`).style.display = "none";
        }
    }
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
            document.getElementById("loginLogout").innerText = "Logout";
            document.getElementById("loginLogout").addEventListener("click", () => {
                signOut(auth).then(() => {
                    window.location = "/home";
                })
                .catch((err) => {
                    window.location = "/home"
                });
            });
        } else {
            document.getElementById("loginLogout").innerText = "Login";
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
        if (document.getElementById("search-bar") === document.activeElement || document.activeElement.classList.contains("search-result")) {
            if (document.getElementById("search-list").classList.contains("invisible")) {
                document.getElementById("search-list").classList.remove("invisible");
            }

            const query = document.getElementById("search-bar").value.toLowerCase();
            if (query !== prev) {
                const list = document.getElementById("search-list");
                if (query !== "") {
                    while (list.childElementCount > 0) {
                        list.removeChild(list.firstChild);
                    }

                    const auth = getAuth(fb);
                    // if (!connected) {
                    //     connectAuthEmulator(auth, "http://localhost:9099");
                    //     connected = true;
                    // }
                    auth.onAuthStateChanged(async (user) => {
                        const idToken = user ? await user.getIdToken() : undefined;
                        let route = "";
                        if (document.getElementById("user_page")) {
                            if (user) {
                                route = `search_user/${idToken}/${query}`;
                            } else {
                                window.location = "/login";
                            }
                        } else {
                            route = `search/${query}`;
                        }

                        let queryStr = "?";
                        if (document.getElementById("category_page")) {
                            queryStr += `category=${document.getElementById("listing_display").classList[0]}`;
                        }
                        if (!document.getElementById("both").classList.contains("active")) {
                            if (queryStr !== "?") {
                                queryStr += "&";
                            }
                            if (document.getElementById("listing_only").classList.contains("active")) {
                                queryStr += "type=listings";
                            } else {
                                queryStr += "type=requests";
                            }
                        }
                        
                        axios({
                            method: "get",
                            url: `${DOMAIN}/${route}${queryStr}`
                        })
                        .then((res) => {
                            const responses = res.data.responses;

                            responses.forEach((response) => {
                                const id = response.id;
                                const type = response.type;
                                const title = response.title;
                                const category = response.category;

                                let exists = false;
                                let buffer = type === "listings" ? listingBuffer : requestBuffer;
                                for (let i = 0; i < buffer.length; i++) {
                                    if (buffer[i].id === id) {
                                        exists = true;
                                        break;
                                    }
                                }

                                let searchSelection;
                                if (!exists) {
                                    searchSelection = document.createElement("button");
                                    searchSelection.type = "button";
                                    searchSelection.addEventListener("click", () => {
                                        const preview = type === "listings" ? document.getElementById("preview_listing") : document.getElementById("preview_request");
                                        if (preview.childElementCount > 0) {
                                            preview.removeChild(preview.firstChild);
                                        }

                                        const previewRoute = type === "listings" ? "listing" : "request";

                                        let previewQueryStr = ""; 
                                        if (user) {
                                            previewQueryStr += `?idToken=${idToken}`;
                                        }

                                        axios({
                                            method: "get",
                                            url: `${DOMAIN}/${previewRoute}/${id}${previewQueryStr}`
                                        })
                                        .then((res) => {
                                            preview.innerHTML = type === "listings" ? res.data.listing.html : res.data.request.html;

                                            populateUserCard(user, id, type);

                                            document.getElementById(`card_${id}`).scrollIntoView();
                                        })
                                        .catch((err) => {
                                            console.log(err);
                                            if (document.getElementById("err-msg")) {
                                                document.getElementById("err-msg").innerText = err.msg;
                                            }
                                        });
                                    });
                                } else {
                                    searchSelection = document.createElement("a");
                                    searchSelection.href = `#card_${id}`;
                                }

                                searchSelection.id = `search_${id}`;
                                searchSelection.classList.add("search-result", "list-group-item", "list-group-item-action");
                                searchSelection.innerText = `${type} - ${title} - ${category}`;

                                list.appendChild(searchSelection);
                            });
                        })
                        .catch((err) => {
                            if (document.getElementById("err-msg")) {
                                document.getElementById("err-msg").innerText = err.msg;
                            }
                        });
                    });
                } else {
                    while (list.childElementCount > 0) {
                        list.removeChild(list.firstChild);
                    }
                }
            }
            prev = query;
        } else {
            document.getElementById("search-list").classList.add("invisible");
        }
    }, 100);
}

if (document.getElementById("home_page") || document.getElementById("category_page") || document.getElementById("user_page")) {
    const auth = getAuth(fb);
    // if (!connected) {
    //     connectAuthEmulator(auth, "http://localhost:9099");
    //     connected = true;
    // }

    await auth.onAuthStateChanged(async (user) => {
        let routes = [];
        let queryStr = "?";

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

            if (user) {
                const idToken = await user.getIdToken();
                queryStr += `idToken=${idToken}`;
            }
        }

        if (document.getElementById("category_page")) {
            if (queryStr !== "?") {
                queryStr += "&";
            }
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
                document.getElementById(`desc_${listing.id}`).innerHTML = document.getElementById(`desc_${listing.id}`).innerHTML.replaceAll("\n", "<br>");

                listingList.appendChild(wrapper);

                populateUserCard(user, listing.id, "listings");

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
                    document.getElementById("err-msg").innerText = err.msg;
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
                document.getElementById(`desc_${request.id}`).innerHTML = document.getElementById(`desc_${request.id}`).innerHTML.replaceAll("\n", "<br>");

                requestList.appendChild(wrapper);

                populateUserCard(user, request.id, "requests");

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
                    document.getElementById("err-msg").innerText = err.msg;
                }
            }
        });

        document.getElementById("load_more_listings").addEventListener("click", () => {
            if (nextListingIndex !== -1) {
                clearSearchAndPreviews();

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

                        populateUserCard(user, listing.id, "listings");

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
                            document.getElementById("err-msg").innerText = err.msg;
                        }
                    }
                });
            }
        });

        document.getElementById("load_more_requests").addEventListener("click", () => {
            if (nextRequestIndex !== -1) {
                clearSearchAndPreviews();

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

                        populateUserCard(user, request.id, "requests")

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
                            document.getElementById("err-msg").innerText = err.msg;
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
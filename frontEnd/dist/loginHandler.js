const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");
let bubbleTextNewUser = document.getElementById("thinkingBubbleTextNewUser");
let bubbleTextLogin = document.getElementById("thinkingBubbleTextLogin");
let stopSpeechFlag = false;
const API_USERS = "http://127.0.0.1:3000/users";
function errorCatcher(data, bubbleText) {
    // Empty Field
    if (data.error.search("All fields are required") != -1) {
        typeText(bubbleText, "All done? Hmmª... |Be sure every field is filled", 60);
    }
    //
    //
    // Nick in use
    else if (data.error.search("Nickname already in use") != -1) {
        typeText(bubbleText, "Oh, noª... Looks like that|*nick* already has a tent| pitched here!", 60);
    }
    // Nick dont exist
    else if (data.error.search("User does not exist") != -1) {
        typeText(bubbleText, "Uh-ohª... That nick is not in our village!", 60);
    }
    //
    //
    // Email in use
    else if (data.error.search("Email already in use") != -1) {
        typeText(bubbleText, "Hmmª... Looks like| someone else is already| using that *email*!", 60);
    }
    // Bad email
    else if (data.error.search("Invalid email format") != -1) {
        typeText(bubbleText, "Can't deliver thatª... |The *email* format's a bit wonky!", 60);
    }
    //
    //
    // Password short
    else if (data.error.search("Password 8 long") != -1) {
        typeText(bubbleText, "Make sure your *password* has 8 characters!", 60);
    }
    // Password 1 number
    else if (data.error.search("Password 1 number") != -1) {
        typeText(bubbleText, "Oopsie! Your *password* needs a *number*!", 60);
    }
    // Password 1 LOWER case
    else if (data.error.search("Password lower case") != -1) {
        typeText(bubbleText, "*Password* must include at least *1 lower case* letter!", 60);
    }
    // Password 1 UPPER case
    else if (data.error.search("Password uper case") != -1) {
        typeText(bubbleText, "*Password* must include at least *1 upper case* letter!", 60);
    }
    // Password 1 SPECIAL character
    else if (data.error.search("Password special character") != -1) {
        typeText(bubbleText, "*Password* must include at least *1 special character* letter!", 60);
    }
    // Wrong Password
    else if (data.error.search("Wrong password") != -1) {
        typeText(bubbleText, "Hmmª... that password is a bit off!", 60);
    }
    //
    //
}
const registerNewUser = async () => {
    const nickname = document.getElementById("inputNickNew").value.trim();
    const email = document.getElementById("inputEmailNew").value.trim();
    const password = document.getElementById("inputPassNew").value.trim();
    try {
        const response = await fetch("http://10.11.242.92:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password, email, nickname }),
        });
        const data = await response.json();
        if (response.ok) {
            typeText(bubbleTextNewUser, "New resident registered!| Welcome *" + nickname + "*!", 60);
        }
        else {
            errorCatcher(data, bubbleTextNewUser);
        }
    }
    catch (err) {
        console.error("Failed to register:", err);
        alert("Something went wrong! " + err);
    }
    return 0;
};
async function loginUser() {
    const identifier = document.getElementById("inputNick").value.trim();
    const password = document.getElementById("inputPass").value.trim();
    console.log("nickname:", identifier);
    console.log("password:", password);
    try {
        const response = await fetch("http://10.11.242.92:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier, password }),
        });
        const data = await response.json();
        if (response.ok) {
            putNickOnProfileHeader(data.user.name);
            setToLogged();
            setNickOnLocalStorage(data.user.name);
            return true;
        }
        else {
            errorCatcher(data, bubbleTextLogin);
            return false;
        }
    }
    catch (err) {
        console.error("Failed to register:", err);
        alert("Something went wrong! " + err);
    }
}
function clickButton(button) {
    button.addEventListener("click", () => {
        if (button.className.search("loginUser") != -1) {
            // loginUser();
        }
        else if (button.className.search("newUser") != -1) {
            // pageProfile = document.getElementById("newUserId");
            // navigateProfile(pageProfile);
            // stopSpech();
            // typeText(bubbleText, "Welcome, new resident!", 60);
        }
        else if (button.className.search("createNew") != -1) {
            // let bubbleText = document.querySelector(".thinkingBubbleText");
            // bubbleText.textContent = "teste";
            registerNewUser();
        }
        else {
        }
    });
}
clickButton(loginButton);
clickButton(newUserButton);
clickButton(createUserButton);
// clickButton(forgotButton);
document.addEventListener("DOMContentLoaded", () => {
    const newUserButton = document.querySelector(".newUser");
    const loginButton = document.getElementById("loginUserButton");
    const backButton = document.getElementById("backButtonNewUser");
    const logoutButton = document.getElementById("logoutButton");
    const profilePage = document.getElementById("profileId");
    const newUserPage = document.getElementById("newUserId");
    const loginPage = document.getElementById("loginId");
    if (checkIfLogged()) {
        changePageTo(loginPage, profilePage);
        putNickOnProfileHeader(getNickOnLocalStorage());
        flipboardNumberAnimation("23");
    }
    //Login Button
    loginButton.addEventListener("click", async () => {
        if ((await loginUser()) === true) {
            changePageTo(loginPage, profilePage);
            flipboardNumberAnimation("23");
        }
    });
    //Logout Button
    logoutButton.addEventListener("click", () => {
        setToUnLogged();
        changePageTo(profilePage, loginPage);
        stopSpech();
        typeText(bubbleTextLogin, "Welcome back!", 60);
    });
    //NewUser Button
    newUserButton.addEventListener("click", () => {
        changePageTo(loginPage, newUserPage);
        stopSpech();
        if (!checkIfLogged()) {
            typeText(bubbleTextNewUser, "Welcome, new resident!", 60);
        }
    });
    //Back Button
    backButton.addEventListener("click", () => {
        changePageTo(newUserPage, loginPage);
        stopSpech();
        if (!checkIfLogged()) {
            typeText(bubbleTextLogin, "Welcome back!", 60);
        }
    });
});
function getNickOnLocalStorage() {
    return localStorage.getItem("nickname");
}
function setNickOnLocalStorage(nickname) {
    localStorage.setItem("nickname", nickname);
}
function checkIfLogged() {
    if (localStorage.getItem("isLogged") === "true") {
        return true;
    }
    else {
        return false;
    }
}
function setToLogged() {
    localStorage.setItem("isLogged", "true");
}
function setToUnLogged() {
    localStorage.setItem("isLogged", "false");
    localStorage.removeItem(getNickOnLocalStorage());
}
function putNickOnProfileHeader(nick) {
    document.querySelector(".profileHeaderText").textContent = "Welcome, " + nick;
}
function changePageTo(remove, activate) {
    remove.classList.remove("active");
    activate.classList.add("active");
}

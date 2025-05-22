const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");
let bubbleTextNewUser = document.getElementById("thinkingBubbleTextNewUser");
let bubbleTextLogin = document.getElementById("thinkingBubbleTextLogin");
let stopSpeechFlag = false;
const API_USERS = "http://127.0.0.1:3000/users";
function errorCatcher(data, bubbleText) {
    if (data.details.search("UNIQUE constraint failed: users.nickname") != -1) {
        typeText(bubbleText, "Oh, noª... Looks like that|*nick* already has a tent| pitched here!", 60);
    }
    else if (data.details.search("UNIQUE constraint failed: users.email") != -1) {
        typeText(bubbleText, "Hmmª... Looks like| someone else is already| using that *email*!", 60);
    }
    else if (data.details.search("Missing field") != -1) {
        typeText(bubbleText, "All done? Hmmª... |Be sure every field is filled", 60);
    }
    else if (data.details.search("User dont exist") != -1) {
        typeText(bubbleText, "Are you real? bad nick", 60);
    }
    else if (data.details.search("Wrong password") != -1) {
        typeText(bubbleText, "Bad password, brother", 60);
    }
}
const registerNewUser = async () => {
    const nickname = document.getElementById("inputNickNew").value.trim();
    const email = document.getElementById("inputEmailNew").value.trim();
    const name = document.getElementById("inputNickNew").value.trim();
    const password = document.getElementById("inputPassNew").value.trim();
    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: nickname, email, nickname, password }),
        });
        const data = await response.json();
        if (response.ok) {
            // alert("ok!");
            return;
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
    const nickname = document.getElementById("inputNick").value.trim();
    const password = document.getElementById("inputPass").value.trim();
    console.log("nickname: " + nickname);
    console.log("pass: " + password);
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nickname, password }),
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
        // console.log(button.className.search("createNew"));
        if (button.className.search("loginUser") != -1) {
            // console.log((document.getElementById("inputNick") as HTMLInputElement).value);
            // console.log((document.getElementById("inputPass") as HTMLInputElement).value);
            // console.log("request from database to see if can login");
            // loginUser();
        }
        else if (button.className.search("newUser") != -1) {
            // pageProfile = document.getElementById("newUserId");
            // navigateProfile(pageProfile);
            // stopSpech();
            // typeText(bubbleText, "Welcome, new resident!", 60);
            // console.log("aqui");
        }
        else if (button.className.search("createNew") != -1) {
            // let bubbleText = document.querySelector(".thinkingBubbleText");
            // bubbleText.textContent = "teste";
            // console.log(bubbleText);
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

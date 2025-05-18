const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");
let bubbleText = document.querySelector(".thinkingBubbleText");
let stopSpeechFlag = false;
const API_USERS = "http://127.0.0.1:3000/users";
// fetch(API_USERS)
// 	.then((res) => res.json())
// 	.then((data) => {
// 		// users = data;
// 		data.forEach((user) => {
// 			console.log("aqui:" + user);
// 		});
// 		// updateWins();
// 		// updateLoses();
// 		// updatePlays();
// 		// updateNick();
// 	});
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
            if (data.details.search("UNIQUE constraint failed: users.nickname") != -1) {
                typeText(bubbleText, "Oh, no... Looks like that|*nick* already has a tent| pitched here!", 60);
            }
            else if (data.details.search("UNIQUE constraint failed: users.email") != -1) {
                typeText(bubbleText, "Hmmª... Looks like| someone else is already| using that *email*!", 60);
            }
            else if (data.details.search("Missing field") != -1) {
                console.log("teste");
                typeText(bubbleText, "All done? Hmmª... |Be sure every field is filled", 60);
            }
            // bubbleText.textContent = `${data.details}`;
            // alert(`Error: ${data.error}`);
        }
    }
    catch (err) {
        console.error("Failed to register:", err);
        alert("Something went wrong! " + err);
    }
    return 0;
};
function clickButton(button) {
    button.addEventListener("click", () => {
        // console.log(button.className.search("createNew"));
        if (button.className.search("loginUser") != -1) {
            // console.log((document.getElementById("inputNick") as HTMLInputElement).value);
            // console.log((document.getElementById("inputPass") as HTMLInputElement).value);
            // console.log("request from database to see if can login");
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
            // console.log(bubbleText);
            registerNewUser();
        }
        else {
            console.log("error on clickButton function");
        }
        // console.log("clicked: " + button.className);
    });
}
clickButton(loginButton);
clickButton(newUserButton);
clickButton(createUserButton);
// clickButton(forgotButton);
document.addEventListener("DOMContentLoaded", () => {
    const loginPage = document.getElementById("loginId");
    const newUserPage = document.getElementById("newUserId");
    const newUserButton = document.querySelector(".newUser");
    const backButton = document.getElementById("backButtonNewUser");
    newUserButton.addEventListener("click", () => {
        loginPage.classList.remove("active");
        newUserPage.classList.add("active");
        typeText(bubbleText, "Welcome, new resident!", 60);
    });
    backButton.addEventListener("click", () => {
        newUserPage.classList.remove("active");
        loginPage.classList.add("active");
        stopSpech();
    });
});
// console.log("teste profile");
// fetch(API_USERS)
// 	.then((res) => res.json())
// 	.then((data) => {
// 		users = data;
// 		data.forEach((user) => {
// 			console.log(user.email);
// 		});
// 		updateWins();
// 		updateLoses();
// 		updatePlays();
// 		updateNick();
// 	});

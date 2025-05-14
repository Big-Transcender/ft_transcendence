const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
let pageProfile = document.getElementById("loginId");

const API_USERS = "http://127.0.0.1:3000/users";

function clickButton(button) {
	button.addEventListener("click", () => {
		if (button.className.search("loginUser") != -1) {
			console.log((document.getElementById("inputNick") as HTMLInputElement).value);
			console.log((document.getElementById("inputPass") as HTMLInputElement).value);
			// console.log("request from database to see if can login");
		} else if (button.className.search("newUser")) {
			pageProfile = document.getElementById("newUserId");
			// navigateProfile(pageProfile);
			console.log("change page to newUser");
		} else {
			console.log("error on clickButton function");
		}
		// console.log("clicked: " + button.className);
	});
}

clickButton(loginButton);
clickButton(newUserButton);

// clickButton(forgotButton);

document.addEventListener("DOMContentLoaded", () => {
	const loginPage = document.getElementById("loginId");
	const newUserPage = document.getElementById("newUserId");
	const newUserButton = document.querySelector(".newUser");
	const backButton = document.getElementById("backButtonNewUser");

	newUserButton.addEventListener("click", () => {
		loginPage.classList.remove("active");
		newUserPage.classList.add("active");
	});

	backButton.addEventListener("click", () => {
		newUserPage.classList.remove("active");
		loginPage.classList.add("active");
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

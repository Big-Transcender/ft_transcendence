const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");

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
	const nickname = (document.getElementById("inputNickNew") as HTMLInputElement).value.trim();
	const email = (document.getElementById("inputEmailNew") as HTMLInputElement).value.trim();
	const name = (document.getElementById("inputNickNew") as HTMLInputElement).value.trim();
	const password = (document.getElementById("inputPassNew") as HTMLInputElement).value.trim();
	let bubbleText = document.querySelector(".thinkingBubbleText") as HTMLInputElement;

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
			alert("ok!");
		} else {
			if (data.details.search("UNIQUE constraint failed: users.nickname") != -1) {
				typeText(bubbleText, "Oh no... Seems like that| this *nick* already exist!", 50);
			} else if (data.details.search("UNIQUE constraint failed: users.email") != -1) {
				typeText(bubbleText, "Oh no... Seems like that| this *e-mail* already exist!", 50);
			} else {
				console.log(data.error.search("UNIQUE constraint failed: users.nickname"));
			}
			// bubbleText.textContent = `${data.details}`;
			// alert(`Error: ${data.error}`);
		}
	} catch (err) {
		console.error("Failed to register:", err);
		alert("Something went wrong!");
	}
	return 0;
};

function clickButton(button) {
	button.addEventListener("click", () => {
		// console.log(button.className.search("createNew"));
		if (button.className.search("loginUser") != -1) {
			console.log((document.getElementById("inputNick") as HTMLInputElement).value);
			console.log((document.getElementById("inputPass") as HTMLInputElement).value);
			// console.log("request from database to see if can login");
		} else if (button.className.search("newUser") != -1) {
			pageProfile = document.getElementById("newUserId");
			// navigateProfile(pageProfile);
			console.log("change page to newUser");
		} else if (button.className.search("createNew") != -1) {
			// let bubbleText = document.querySelector(".thinkingBubbleText");
			// bubbleText.textContent = "teste";
			// console.log(bubbleText);
			registerNewUser();
		} else {
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

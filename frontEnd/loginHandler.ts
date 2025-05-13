const loginButton = document.querySelector(".loginButton");
const forgotButton = document.querySelector(".forgotButton");
const newUserButton = document.querySelector(".newUserButton");
const API_USERS = "http://127.0.0.1:3000/users";

function clickButton(button) {
	button.addEventListener("click", () => {
		if (button.className === "loginButton") {
			console.log((document.querySelector(".inputNick") as HTMLInputElement).value);
			console.log((document.querySelector(".inputPass") as HTMLInputElement).value);
			// console.log("request from database to see if can login");
		} else if (button.className === "forgotButton") {
			console.log("change page to forgot");
		} else {
			console.log("change page to new user");
		}
		// console.log("clicked: " + button.className);
	});
}

clickButton(loginButton);
clickButton(newUserButton);
clickButton(forgotButton);

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

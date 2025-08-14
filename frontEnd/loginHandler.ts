const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");
let QrCode = document.getElementById("QrCodeId");
let bubbleTextNewUser = document.getElementById("thinkingBubbleTextNewUser") as HTMLInputElement;
let bubbleTextLogin = document.getElementById("thinkingBubbleTextLogin") as HTMLInputElement;
let stopSpeechFlag = false;

let currentNickName;
let userIsLogged;

// const API = "http://localhost:3000/";
// const API = "http://10.11.3.4:3000/";
// const API = "http://10.11.3.2:3000/"; //diogo machine

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
	const nickname = (document.getElementById("inputNickNew") as HTMLInputElement).value.trim();
	const email = (document.getElementById("inputEmailNew") as HTMLInputElement).value.trim();
	const password = (document.getElementById("inputPassNew") as HTMLInputElement).value.trim();

	try {
		const response = await fetch(`${backendUrl}/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ password, email, nickname }),
		});

		const data = await response.json();

		if (response.ok) {
			typeText(bubbleTextNewUser, "New resident registered!| Welcome *" + nickname + "*!", 60);
		} else {
			errorCatcher(data, bubbleTextNewUser);
		}
	} catch (err) {
		console.error("Failed to register:", err);
		alert("Something went wrong! " + err);
	}
	return 0;
};

async function loginUser() {
	const identifier = (document.getElementById("inputNick") as HTMLInputElement).value.trim();
	const password = (document.getElementById("inputPass") as HTMLInputElement).value.trim();

	console.log("nickname:", identifier);
	console.log("password:", password);
	try {
		const response = await fetch(`${backendUrl}/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ identifier, password }),
		});

		const data = await response.json();

		if (response.ok) {
			putNickOnProfileHeader(data.user.name);
			setToLogged();
			setNickOnLocalStorage(data.user.name);
			localStorage.setItem("token", data.token);
			return true;
		} else {
			errorCatcher(data, bubbleTextLogin);
			return false;
		}
	} catch (err) {
		console.error("Failed to register:", err);
		alert("Something went wrong! " + err);
	}
}
function clickButton(button) {
	button.addEventListener("click", () => {
		if (button.className.search("loginUser") != -1) {
			loginUser();
		} else if (button.className.search("newUser") != -1) {
			// pageProfile = document.getElementById("newUserId");
			// navigateProfile(pageProfile);
			// stopSpech();
			// typeText(bubbleText, "Welcome, new resident!", 60);
		} else if (button.className.search("createNew") != -1) {
			// let bubbleText = document.querySelector(".thinkingBubbleText");
			// bubbleText.textContent = "teste";
			registerNewUser();
		} else {
		}
	});
}

clickButton(loginButton);
clickButton(newUserButton);
clickButton(createUserButton);

document.addEventListener("DOMContentLoaded", async () => {
	const newUserButton = document.querySelector(".newUser");
	const loginButton = document.getElementById("loginUserButton");
	const backButton = document.getElementById("backButtonNewUser");
	const gLoginButton = document.getElementById("gLoginId");
	const backButton2F = document.getElementById("back2FId");
	const logoutButton = document.getElementById("logoutButton");
	const twoAFButton = document.getElementById("twoFactorButtonID");
	const showQrCodeButton = document.getElementById("showQrButtonID");
	const twoFactorButton = document.getElementById("verifyTwoFactorButtonID");
	const switchNickButton = document.getElementById("switchNickButtonID");

	const profilePage = document.getElementById("profileId");
	const newUserPage = document.getElementById("newUserId");
	const twoFactorPage = document.getElementById("twoFactorId");
	const loginPage = document.getElementById("loginId");

	await checkGoogleLogin();
	// await checkGoogleLogin();
	if (checkIfLogged()) {
		changePageTo(loginPage, profilePage);
		putNickOnProfileHeader(getNickOnLocalStorage());
		getUserStats(getNickOnLocalStorage());
		// flipboardNumberAnimation("23");
	}

	//Login Button
	loginButton.addEventListener("click", async () => {
		if ((await loginUser()) === true) {
			await updateFriends();
			changePageTo(loginPage, profilePage);
			getUserStats(getNickOnLocalStorage());
			// flipboardNumberAnimation("23");
		}
	});

	// LOGIN GOOGLE
	gLoginButton.addEventListener("click", async () => {
		// changePageTo(loginPage, twoFactorPage);
		window.location.href = `${backendUrl}/logingoogle`;
	});

	// switchNickButton.addEventListener("click", async () => {
	// 	// let person = prompt("new nickname");
	// 	// console.log("Fodese: " + person);
	// 	abrirPopup();
	// 	// changePageTo(loginPage, twoFactorPage);
	// 	// window.location.href = `${backendUrl}/logingoogle`;
	// });

	//Logout Button
	logoutButton.addEventListener("click", async () => {
		try {
			await fetch(`${backendUrl}/logout`, {
				method: "GET",
				credentials: "include",
			});
		} catch (err) {
			console.error("Logout failed:", err);
		}

		setToUnLogged();
		localStorage.clear();
		changePageTo(profilePage, loginPage);
		stopSpech();
		typeText(bubbleTextLogin, "Welcome back!", 60);
		getUserStats(getNickOnLocalStorage());
	});

	// GENERATE QR CODE
	showQrCodeButton.addEventListener("click", () => {
		let QrCodeBox = document.getElementById("QrCodeBoxId") as HTMLElement;
		let QrCodePlace = document.getElementById("QrCodeId") as HTMLElement;

		//#TODO MAKE A API TO CHECK IF THE QR WAS GENERATED FOR THIS USER
		// IF SO, DO LET IT GENERATE AGAIN, IF NOT, GENERATE

		fetch(`${backendUrl}/2fa/setup`, {
			method: "POST",
			credentials: "include", // Important if using cookies/session
			headers: {
				Accept: "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) throw new Error("Network response was not ok");
				return response.json();
			})
			.then((data) => {
				QrCodeBox.style.backgroundImage = "url(" + data.qr + ")";
				QrCodePlace.style.opacity = "1";
			})
			.catch((error) => {
				console.error("Error fetching 2FA setup:", error);
			});
	});

	//2AF Button
	twoAFButton.addEventListener("click", () => {
		changePageTo(profilePage, twoFactorPage);
	});

	// TWO FACTTOR BUTTON
	twoFactorButton.addEventListener("click", () => {
		const twoFactorInput = (document.getElementById("twoFactorPass") as HTMLInputElement).value.trim();

		console.log("2F input: " + twoFactorInput);
		fetch(`${backendUrl}/2fa/verify`, {
			method: "POST",
			credentials: "include", // Needed if using session/cookies
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token: twoFactorInput, // Replace with the actual token from user input
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.success) {
					console.log("2FA verified!");
					// Handle success (e.g., redirect or show message)
				} else {
					displayWarning(data.error);
					console.error("2FA failed:", data.error);
					// Handle failure (e.g., show error to user)
				}
			})
			.catch((error) => {
				// displayWarning(error);
				console.error("Error verifying 2FA:", error);
			});
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

	//BACK BUTTON 2F
	backButton2F.addEventListener("click", () => {
		changePageTo(twoFactorPage, profilePage);
		// stopSpech();
		// if (!checkIfLogged()) {
		// 	typeText(bubbleTextLogin, "Welcome back!", 60);
		// }
	});
});

function getNickOnLocalStorage() {
	return localStorage.getItem("nickname");
}

function setNickOnLocalStorage(nickname: string) {
	localStorage.setItem("nickname", nickname);
}

function checkIfLogged() {
	if (localStorage.getItem("isLogged") === "true") {
		return true;
	} else {
		return false;
	}
}

function setToLogged() {
	setTimeout(() => {
		startPresenceSocket();
	}, 500);
	localStorage.setItem("isLogged", "true");
}

function setToUnLogged() {
	stopPresenceSocket();
	localStorage.setItem("isLogged", "false");
	localStorage.removeItem(getNickOnLocalStorage());
}

function putNickOnProfileHeader(nick: string) {
	document.querySelector(".profileHeaderText").textContent = "Welcome, " + nick;
}

function changePageTo(remove, activate) {
	remove.classList.remove("active");
	activate.classList.add("active");
}

async function checkGoogleLogin() {
	try {
		const res = await fetch(`${backendUrl}/me`, {
			credentials: "include",
		});
		const text = await res.text();
		if (res.ok) {
			const data = JSON.parse(text);
			if (data.user) {
				setToLogged();
				setNickOnLocalStorage(data.user.nickname);
				putNickOnProfileHeader(data.user.nickname);
				changePageTo(document.getElementById("loginId"), document.getElementById("profileId"));
			} else {
				console.warn("No user found in response");
			}
		} else {
			console.warn("Response not OK");
		}
	} catch (err) {
		console.error("Error checking Google login:", err);
	}
}

const loginButton = document.querySelector(".loginUser");
const newUserButton = document.querySelector(".newUser");
const createUserButton = document.getElementById("loginButtonNewUser");
let pageProfile = document.getElementById("loginId");
let QrCode = document.getElementById("QrCodeId");
let bubbleTextNewUser = document.getElementById("thinkingBubbleTextNewUser") as HTMLInputElement;
let bubbleTextLogin = document.getElementById("thinkingBubbleTextLogin") as HTMLInputElement;
let stopSpeechFlag = false;

const profilePage = document.getElementById("profileId");
const newUserPage = document.getElementById("newUserId");
const twoFactorPage = document.getElementById("twoFactorId");
const loginPage = document.getElementById("loginId");

let currentNickName;
let userIsLogged;

// const API = "http://localhost:3000/";
// const API = "http://10.11.3.4:3000/";
// const API = "http://10.11.3.2:3000/"; //diogo machine

(async () => {
	await checkProfileMainPage();
})();

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
	else if (data.error.search("Nickname too long") != -1) {
		typeText(bubbleText, "Ohª... That nick is too long!", 60);
	}

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

async function loginUserVerified() {
	const identifier = (document.getElementById("inputNick") as HTMLInputElement).value.trim();
	const password = (document.getElementById("inputPass") as HTMLInputElement).value.trim();

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
			localStorage.setItem("token", data.token);
			putNickOnProfileHeader(data.user.name);
			setToLogged();
			setNickOnLocalStorage(data.user.name);
			changePageTo(loginPage, profilePage);
			getUserStats(getNickOnLocalStorage());
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

async function loginUser() {
	const identifier = (document.getElementById("inputNick") as HTMLInputElement).value.trim();
	const password = (document.getElementById("inputPass") as HTMLInputElement).value.trim();

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
			localStorage.setItem("token", data.token);

			if (await check2FAStatus()) {
				await open2FApopup();
			} else {
				putNickOnProfileHeader(data.user.name);
				setToLogged();
				setNickOnLocalStorage(data.user.name);
				return true;
			}
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
		// if (button.className.search("loginUser") != -1) {
		// 	loginUser();
		if (button.className.search("newUser") != -1) {
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

async function open2FApopup() {
	document.getElementById("popupContainer2FA").style.display = "flex";
	// document.querySelector(".frontpagePopup").classList.add("displayPagePopup");
}

function close2FApopup() {
	document.getElementById("popupContainer2FA").style.display = "none";
}

function openVictory(quote) {
	document.querySelector(".pongVictory").innerHTML = quote;
	document.getElementById("popupContainerVictory").style.display = "flex";
}

function closeVictory() {
	document.getElementById("popupContainerVictory").style.display = "none";
	window.dispatchEvent(
		new CustomEvent("next", {
			detail: true,
		})
	);
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
	const twoFactorDisableButton = document.getElementById("disableTwoFactorButtonID");

	// await checkGoogleLogin();
	await checkGoogleLogin();
	if (await checkIfLogged()) {
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
	showQrCodeButton.addEventListener("click", async () => {
		const token = localStorage.getItem("token");
		if (!token) {
			console.warn("No auth token found.");
			return;
		}

		// Optional: prevent multiple generations once enabled
		const alreadyEnabled = await check2FAStatus();
		if (alreadyEnabled === true) {
			displayWarning("2FA already enabled.");
			return;
		}

		let QrCodeBox = document.getElementById("QrCodeBoxId") as HTMLElement;
		let QrCodePlace = document.getElementById("QrCodeId") as HTMLElement;

		try {
			const response = await fetch(`${backendUrl}/2fa/setup`, {
				method: "POST",
				credentials: "include",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.status === 401) {
				displayWarning("Unauthorized. Please login again.");
				// setToUnLogged(); #TODO MAKE TO UNLOGGED
				return;
			}
			if (!response.ok) {
				const errTxt = await response.text();
				throw new Error(errTxt || `HTTP ${response.status}`);
			}

			const data = await response.json();
			if (!data.qr) {
				throw new Error("QR code not in response.");
			}

			QrCodeBox.style.backgroundImage = `url(${data.qr})`;
			QrCodePlace.style.opacity = "1";
		} catch (error) {
			console.error("Error fetching 2FA setup:", error);
			displayWarning("Failed to generate QR.");
		}
	});

	// 2AF Button PROFILE
	twoAFButton.addEventListener("click", async () => {
		changePageTo(profilePage, twoFactorPage);
		if (await check2FAStatus()) {
			document.getElementById("verifyTwoFactorButtonID").style.display = "none";
			document.getElementById("showQrButtonID").style.display = "none";
			document.getElementById("disableTwoFactorButtonID").style.display = "block";
		} else {
			document.getElementById("verifyTwoFactorButtonID").style.display = "block";
			document.getElementById("showQrButtonID").style.display = "block";
			document.getElementById("disableTwoFactorButtonID").style.display = "none";
		}
		let QrCodePlace = document.getElementById("QrCodeId") as HTMLElement;
		QrCodePlace.style.opacity = "0";
	});

	// VERIFY 2FA CODE ON PROFILE BUTTON
	twoFactorButton.addEventListener("click", () => {
		const twoFactorInput = (document.getElementById("twoFactorPass") as HTMLInputElement).value.trim();
		verify2FACode(twoFactorInput);
	});

	twoFactorDisableButton.addEventListener("click", () => {
		const twoFactorInput = (document.getElementById("twoFactorPass") as HTMLInputElement).value.trim();
		disable2FA(twoFactorInput);
	});

	//NewUser Button
	newUserButton.addEventListener("click", async () => {
		if (await !checkIfLogged()) {
			typeText(bubbleTextNewUser, "Welcome, new resident!", 60);
		}
		changePageTo(loginPage, newUserPage);

		stopSpech();
	});

	//Back Button
	backButton.addEventListener("click", async () => {
		changePageTo(newUserPage, loginPage);
		stopSpech();
		if (await !checkIfLogged()) {
			typeText(bubbleTextLogin, "Welcome back!", 60);
		}
	});

	//BACK BUTTON 2F
	backButton2F.addEventListener("click", () => {
		changePageTo(twoFactorPage, profilePage);
	});
});

async function getNickOnLocalStorageSync(): Promise<string | null> {
	try {
		const res = await fetch(`${backendUrl}/me`, {
			credentials: "include",
		});
		if (res.ok) {
			const user = await res.json();
			console.log("heres the nick ", user);
			return user.nickname;
		}
	} catch (err) {
		console.error("Error checking Google login:", err);
	}
	return null;
}

function getNickOnLocalStorage() {
	let nickname: string | null = null;
	getNickOnLocalStorageSync().then((res) => (nickname = res));
	console.log("heres the nick ", nickname);
	return localStorage.getItem("nickname");
}

// function getNickOnLocalStorage(): string | null {
// 	let nickname: string | null = null;
// 	getNickOnLocalStorageSync().then((res) => (nickname = res));
// 	return nickname;
// }

function getTournamentPin() {
	return localStorage.getItem("pin");
}

function setNickOnLocalStorage(nickname: string) {
	localStorage.setItem("nickname", nickname);
}

async function askMeApi() {
	try {
		const res = await fetch(`${backendUrl}/me`, {
			credentials: "include",
		});
		const text = await res.text();
		if (res.ok) {
			return true;
		}
	} catch (err) {
		console.error("Error checking Google login:", err);
	}
	return false;
}
async function checkIfLogged() {
	if (await askMeApi()) {
		return true;
	} else {
		// const loginPage = document.getElementById("loginId");
		// const profileDivs = document.querySelectorAll(".profileId");

		// profileDivs.forEach((div) => {
		// 	if (div.classList.contains("active")) {
		// 		if (div.classList.contains("loginPage")) return;
		// 		if (div.classList.contains("newUserPage")) {
		// 			// Se for a div de novo usuário e estiver ativa, não faz nada
		// 			return;
		// 		}
		// 		// div.classList.remove("active");
		// 	}
		// });
		// loginPage.classList.add("active");
		// changePageTo(loginPage, loginPage);
		return false;
	}
}

async function checkProfileMainPage() {
	await new Promise((resolve) => setTimeout(resolve, 150));
	if (await askMeApi()) {
		return;
	} else {
		const loginPage = document.getElementById("loginId");
		loginPage.classList.remove("active");
		const profileDivs = document.querySelectorAll(".profileId");

		profileDivs.forEach((div) => {
			if (div.classList.contains("active")) {
				if (div.classList.contains("newUserPage")) return;
				if (div.classList.contains("profilePage")) return;
				if (div.classList.contains("twoFactorPage")) return;
				// if (div.classList.contains("loginPage")) return;
			}
			// div.classList.remove("active");
			// loginPage.classList.add("active");
		});
		loginPage.classList.add("active");
	}
}

function setToLogged() {
	setTimeout(() => {
		startPresenceSocket();
	}, 500);
	// localStorage.setItem("isLogged", "true");
}

function setToUnLogged() {
	stopPresenceSocket();
	// localStorage.setItem("isLogged", "false");
	// localStorage.removeItem(getNickOnLocalStorage());
}

function putNickOnProfileHeader(nick: string) {
	document.querySelector(".profileHeaderText").textContent = "Welcome, " + nick;
}

function changePageTo(remove, activate) {
	remove.classList.remove("active");
	activate.classList.add("active");
}

async function verify2FACode(twoFactorInput: string) {
	console.log("2F input: " + twoFactorInput);
	const token = localStorage.getItem("token");
	fetch(`${backendUrl}/2fa/verify`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
		body: JSON.stringify({
			token: twoFactorInput, // Replace with the actual token from user input
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				displayWarning("2FA verified!");
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
}

async function verify2FACodePopup() {
	const twoFactorInput = (document.getElementById("AFCode") as HTMLInputElement).value.trim();
	console.log("2F input popup: " + twoFactorInput);
	const token = localStorage.getItem("token");
	fetch(`${backendUrl}/2fa/verify`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		credentials: "include",
		body: JSON.stringify({
			token: twoFactorInput, // Replace with the actual token from user input
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success) {
				// displayWarning("2FA verified!");
				close2FApopup();
				loginUserVerified();
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
}

async function check2FAStatus() {
	try {
		const response = await fetch(`${backendUrl}/2fa/status`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`, // Assuming token is stored in localStorage
			},
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.status} - ${response.statusText}`);
		}

		const data = await response.json();
		console.log("Has 2FA: " + data.enabled);
		return data.enabled; // Returns true if 2FA is enabled, false otherwise
	} catch (error) {
		displayWarning("Failed to check 2FA status: " + error);
		return null; // Return null in case of an error
	}
}

async function disable2FA(twoFactorInput: string) {
	const token = twoFactorInput;
	const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage

	if (!token) {
		displayWarning("Token is required");
		return;
	}

	try {
		const response = await fetch(`${backendUrl}/2fa/disable`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: JSON.stringify({ token }),
		});

		const data = await response.json();

		if (response.ok) {
			displayWarning("2FA disabled successfully!");
		} else {
			displayWarning(data.error || "Failed to disable 2FA");
		}
	} catch (error) {
		console.error("Error disabling 2FA:", error);
		displayWarning("An error occurred while disabling 2FA");
	}
}

function getCookie(name: string) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(";").shift();
	return null;
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
				// Set JWT from cookie to localStorage
				const token = getCookie("token");
				if (token) localStorage.setItem("token", token);
			} else {
				console.warn("No user found in response");
			}
		}
	} catch (err) {
		console.error("Error checking Google login:", err);
	}
}

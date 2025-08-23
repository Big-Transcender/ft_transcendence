let winsNumber = document.getElementById("boxWinsNumber");
let losesNumber = document.getElementById("boxLosesNumber");
let gamesNumber = document.getElementById("boxGamesNumber");
let positionNumber = document.getElementById("positionId");
let winRateText = document.getElementById("winRateTextId");
const gustSound = new Audio("/audios/gust.wav");
const flipSound = new Audio("/audios/flip.wav");

const backendUrl = `/api`;
const frontendUrl = `/api`;

const matchesProfile = document.querySelector(".matchesProfile") as HTMLElement;
const friendsProfile = document.querySelector(".friendsProfile") as HTMLElement;
const matchesButton = document.getElementById("matchesButtonID");
const friendsButton = document.getElementById("friendsButtonID");

let matchOpen = false;
let friendsOpen = false;
let isPlayingSoundMatch = false;
let isPlayingSoundFriends = false;


(async () => {
	getUserStats(await getNickOnLocalStorage());
})();
preVisualizePhoto();

async function flipboardNumberAnimation(target: string, targetBox): Promise<boolean> {
	targetBox.textContent = "";

	let flips = 50;
	let delay = 100;

	const spans: HTMLSpanElement[] = [];
	for (let i = 0; i < target.length; i++) {
		const span = document.createElement("span");
		span.textContent = "0";
		targetBox.appendChild(span);
		spans.push(span);
	}

	const locked: boolean[] = new Array(target.length).fill(false);

	const startTime = Date.now();
	while (Date.now() - startTime < 2000) {
		for (let i = 0; i < spans.length; i++) {
			spans[i].textContent = Math.floor(Math.random() * 10).toString();
		}
		await new Promise((res) => setTimeout(res, delay));
	}

	for (let i = 0; i < target.length; i++) {
		spans[i].textContent = target[i];
	}
	return true;
}

async function getUserPosition(): Promise<string> {
	const userNick = localStorage.getItem("nickname");
	try {
		// const response = await fetch(`${backendUrl}/leaderboard/position/${userNick}`);
		// const response = await fetch(`${backendUrl}/leaderboard/position/`);
		const token = getCookie("token");
		const response = await fetch(`${backendUrl}/leaderboard/position/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		if (!response.ok) {
			const err = await response.json();
			throw new Error(err.error || "Unknown error");
		}
		const data = await response.json();
		return data.position.toString();
	} catch (error) {
		console.error("Failed to fetch leaderboard position:", (error as Error).message);
		return "";
	}
}
async function getUserStats(nickname: string) {
	const token = getCookie("token");
	if (await checkIfLogged()) {
		fetch(`${backendUrl}/player-stats/${nickname}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		})
			.then((response) => {
				if (!response.ok) {
					return response.json().then((err) => {
						throw new Error(err.error || "Unknown error");
					});
				}
				return response.json();
			})
			.then(async (stats) => {
				const positionStr: string = await getUserPosition();
				flipboardNumberAnimation(stats.wins.toString(), winsNumber);
				flipboardNumberAnimation(stats.defeats.toString(), losesNumber);
				flipboardNumberAnimation(stats.games_played.toString(), gamesNumber);
				flipboardNumberAnimation(positionStr, positionNumber);

				if (window.location.hash === "#profile") {
					flipSound.currentTime = 0;
					flipSound.play();
					setTimeout(() => {
						flipSound.pause();
						flipSound.currentTime = 0;
					}, 2000);
				}

				await setProfileAvatar();
				winRateText.textContent = "Current Winrate: " + stats.win_percentage;
			})
			.catch((error) => {
				console.error("Failed to fetch player stats:", error.message);
			});
	}
}

document.querySelectorAll(".winsBox").forEach((box) => {
	box.addEventListener("mouseenter", () => {
		box.classList.add("wind-animate");
		gustSound.pause();
		gustSound.currentTime = 0;
		gustSound.play();
	});
	box.addEventListener("animationend", () => {
		box.classList.remove("wind-animate");
	});
});

document.addEventListener("DOMContentLoaded", async () => {
	const profileOptions = document.getElementById("profileOptionsButtonID");

	const addFriendsButton = document.getElementById("addFriendId");
	const refreshMatchesButton = document.getElementById("refreshMatchId");

	const photoPopupButtom = document.getElementById("popupPhotoButtonID");
	const popupNickButton = document.getElementById("popupNickButtonID");
	const popupEmailButton = document.getElementById("popupEmailButtonID");
	const popupPasswordButton = document.getElementById("popupPasswordButtonID");

	const frontpagePopup = document.querySelector(".frontpagePopup");
	const nickpagePopup = document.querySelector(".nickpagePopup");
	const emailpagePopup = document.querySelector(".emailpagePopup");
	const passwordpagePopup = document.querySelector(".passwordpagePopup");
	const photopagePopup = document.querySelector(".photopagePopup");

	// PROFILE OPTIONS
	profileOptions.addEventListener("click", () => {
		openPopup();
	});

	// OPEN MATCH HISTORY
	matchesButton.addEventListener("click", () => {
		updateMatchHistory();
		matchesAnimationHandler();
	});

	// OPEN FRIEND LIST
	friendsButton.addEventListener("click", async () => {
		if (!friendsOpen) {
			await updateFriends();
		}
		friendsAnimationHandler();
	});

	//ADD FRIEND BUTTOM
	addFriendsButton.addEventListener("click", async () => {
		const addFriendInput = (document.getElementById("inputFriend") as HTMLInputElement).value.trim();
		if (!addFriendInput) {
			displayWarning("No nick!");
			return;
		}
		addfriendHandler(addFriendInput);
	});

	// REFRESH MATCHES LIST BUTTOM
	refreshMatchesButton.addEventListener("click", async () => {
		updateMatchHistory();
	});

	// POPUP PHOTO BUTTOM
	photoPopupButtom.addEventListener("click", async () => {
		await betterWait(150);
		changePopupTo(frontpagePopup, photopagePopup);

		const fileInput = document.getElementById("fileInput") as HTMLInputElement;
		fileInput.value = "";
	});

	// POPUP NICK BUTTOM
	popupNickButton.addEventListener("click", async () => {
		await betterWait(150);
		changePopupTo(frontpagePopup, nickpagePopup);
	});

	// POPUP EMAIL BUTTOM
	popupEmailButton.addEventListener("click", async () => {
		await betterWait(150);
		changePopupTo(frontpagePopup, emailpagePopup);
	});

	// POPUP PASSWORK BUTTOM
	popupPasswordButton.addEventListener("click", async () => {
		await betterWait(150);
		//#TODO If is Google login, block the user to access this page
		changePopupTo(frontpagePopup, passwordpagePopup);
	});
});

function changePopupTo(remove, activate) {
	remove.classList.remove("displayPagePopup");
	activate.classList.add("displayPagePopup");
}

async function addfriendHandler(friendNick: string): Promise<void> {
	const token = localStorage.getItem("token");
	try {
		const response = await fetch(`${backendUrl}/friends/add`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ friendNickname: friendNick }),
		});

		const data = await response.json();

		if (!response.ok) {
			displayWarning(data.error || "Failed to add friend");
			return;
		}

		displayWarning("Friend added successfully!");
		await updateFriends();
	} catch (error: any) {
		const errorMessage = (error as Error).message || "Error adding friend";
		displayWarning(errorMessage);
	}
}

async function removefriendHandler(friendNick: string): Promise<void> {
	const token = localStorage.getItem("token");
	try {
		const response = await fetch(`${backendUrl}/friends/remove`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ friendNickname: friendNick }),
		});

		const data = await response.json();

		if (!response.ok) {
			displayWarning(data.error || "Failed to remove friend");
			return;
		}

		displayWarning("Friend removed successfully!");
		await updateFriends();
	} catch (error: any) {
		const errorMessage = (error as Error).message || "Error removing friend";
		displayWarning(errorMessage);
	}
}

function openPopup() {
	document.getElementById("popupContainer").style.display = "flex";
	document.querySelectorAll(".popupPage").forEach((el) => {
		el.classList.remove("displayPagePopup");
	});
	document.querySelector(".frontpagePopup").classList.add("displayPagePopup");
}

function closePopup() {
	document.getElementById("popupContainer").style.display = "none";
}

async function changeNickPopup() {
	const newNick = (document.getElementById("popupNewNick") as HTMLInputElement).value.trim();

	if (!newNick) displayWarning("No nick has been given!");
	else {
		await changeNickAPI(newNick);
	}
}

async function changeEmailPopup() {
	const newEmail = (document.getElementById("popupNewEmail") as HTMLInputElement).value.trim();

	if (!newEmail) displayWarning("No email has been given!");
	else {
		await changeEmailAPI(newEmail);
	}
}

function changePasswordPopup() {
	const oldPassword = (document.getElementById("popupOldPassword") as HTMLInputElement).value.trim();
	const newPassword = (document.getElementById("popupNewPassword") as HTMLInputElement).value.trim();

	if (!newPassword || !oldPassword) displayWarning("No password has been given!");
	else {
		changePasswordAPI(newPassword, oldPassword);
	}
}

function changePhotoPopup() {
	const newPhoto = document.getElementById("fileInput") as HTMLInputElement | null;

	if (!newPhoto || !newPhoto.files || newPhoto.files.length === 0) {
		displayWarning("No photo has been given!");
		return;
	}

	const file = newPhoto.files[0];
	const formData = new FormData();
	formData.append("file", file);

	fetch(`${backendUrl}/avatar`, {
		method: "POST",
		body: formData,
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`,
		},
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.success && data.url) {
				// Update only profile photo location elements
				const photoElements = document.querySelectorAll(".profilePhotoLocation");
				photoElements.forEach((el) => {
					if (el instanceof HTMLImageElement) {
						el.src = backendUrl + data.url + "?t=" + Date.now(); // cache busting
					} else {
						(el as HTMLElement).style.backgroundImage = `url('${backendUrl + data.url}?t=${Date.now()}')`;
					}
				});
				setProfileAvatar(); // Ensure avatar is refreshed everywhere after upload
				displayWarning("Photo updated successfully!");
			} else {
				displayWarning("Failed to update photo.");
			}
		})
		.catch(() => {
			displayWarning("Error uploading photo.");
		});
}

function preVisualizePhoto() {
	document.addEventListener("DOMContentLoaded", () => {
		const fileInput = document.getElementById("fileInput") as HTMLInputElement;
		const photoLocation = document.querySelector(".profilePhotoLocation") as HTMLElement;

		if (fileInput && photoLocation) {
			fileInput.addEventListener("change", (event) => {
				const target = event.target as HTMLInputElement;
				if (target.files && target.files[0]) {
					const reader = new FileReader();
					reader.onload = function (e) {
						photoLocation.style.backgroundImage = `url('${e.target?.result}')`;
					};
					reader.readAsDataURL(target.files[0]);
				}
			});
		}
	});
}

async function matchesAnimationHandler() {
	if (!matchOpen && !isPlayingSoundMatch) {
		matchesButton.classList.add("open");
		// updateLeaderboard();
		isPlayingSoundMatch = true;
		openSound.play();
		matchesProfile.classList.remove("closeMatchAnimation");
		matchesProfile.classList.add("openMatchAnimation");
		await betterWait(1500);
		matchesProfile.style.left = "-25%";
		matchesProfile.style.opacity = "1";
		matchesProfile.classList.remove("openMatchAnimation");
		await betterWait(100);
		matchOpen = true;
		isPlayingSoundMatch = false;
	} else if (matchOpen && !isPlayingSoundMatch) {
		matchesButton.classList.remove("open");
		closeSound.play();
		isPlayingSoundMatch = true;
		matchesProfile.classList.remove("openMatchAnimation");
		matchesProfile.classList.add("closeMatchAnimation");
		await betterWait(1000);
		matchesProfile.style.left = "30%";
		matchesProfile.style.opacity = "none";
		matchesProfile.classList.remove("closeMatchAnimation");
		await betterWait(100);
		matchOpen = false;
		isPlayingSoundMatch = false;
	}
}

async function friendsAnimationHandler() {
	if (!friendsOpen && !isPlayingSoundFriends) {
		friendsButton.classList.add("open");
		isPlayingSoundFriends = true;
		openSound2.play();
		friendsProfile.classList.remove("closeFriendsAnimation");
		friendsProfile.classList.add("openFriendsAnimation");
		await betterWait(1000);
		friendsProfile.classList.remove("openFriendsAnimation");
		friendsProfile.style.left = "125%";
		friendsOpen = true;
		isPlayingSoundFriends = false;
	} else if (friendsOpen && !isPlayingSoundFriends) {
		friendsButton.classList.remove("open");
		isPlayingSoundFriends = true;
		closeSound2.play();
		friendsProfile.classList.add("closeFriendsAnimation");
		friendsProfile.classList.remove("openFriendsAnimation");
		friendsOpen = false;
		await betterWait(1000);
		friendsProfile.classList.remove("closeFriendsAnimation");
		friendsProfile.style.left = "70%";
		isPlayingSoundFriends = false;
	}
}

async function updateFriends() {
	try {
		const token = getCookie("token");
		const response = await fetch(`${backendUrl}/friends`, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		const table = document.getElementById("friendListId") as HTMLTableElement;

		if (!table) {
			console.error("Friends table not found!");
			return;
		}

		// Clear existing rows (except header)
		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		const maxRows = 5;

		if (data.friends.length === 0) {
			// Fill first 5 positions with default string
			for (let i = 0; i < maxRows; i++) {
				const row = table.insertRow();
				row.insertCell().textContent = "-----";
				row.insertCell().textContent = "-----";
			}
		} else {
			// Insert new rows for each friend
			data.friends.forEach((friend) => {
				const row = table.insertRow();

				const nameCell = row.insertCell();

				const deleteButton = document.createElement("button");
				deleteButton.textContent = "❌";
				deleteButton.style.marginRight = "8px";
				deleteButton.style.cursor = "pointer";
				deleteButton.title = "Remove Friend";
				deleteButton.addEventListener("click", async () => {
					await removefriendHandler(friend.nickname);
				});

				nameCell.appendChild(deleteButton);
				nameCell.appendChild(document.createTextNode(friend.nickname));

				const statusCell = row.insertCell();
				if (friend.isOnline) {
					statusCell.innerHTML = '<span style="color: #063508ff;">🟢 Online</span>';
					statusCell.className = "online-status";
				} else {
					statusCell.innerHTML = '<span style="color: #757575;">🔴 Offline</span>';
					statusCell.className = "offline-status";
				}
			});

			// Fill remaining rows with placeholders if less than 5 friends
			for (let i = data.friends.length; i < maxRows; i++) {
				const row = table.insertRow();
				row.insertCell().textContent = "-----";
				row.insertCell().textContent = "-----";
			}
		}

		// Make the table scrollable if there are more than 5 friends
		if (data.friends.length > maxRows) {
			table.style.display = "block";
			table.style.overflowY = "scroll";
			table.style.maxHeight = "342px";
		} else {
			table.style.display = "table";
			table.style.overflowY = "unset";
			table.style.maxHeight = "unset";
		}
	} catch (error) {
		const table = document.getElementById("friendListId") as HTMLTableElement;
		if (table) {
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			for (let i = 0; i < 5; i++) {
				const row = table.insertRow();
				const cell1 = row.insertCell();
				const cell2 = row.insertCell();
				if (i === 0) {
					cell1.textContent = "Error loading friends";
					cell2.textContent = `${error}`;
					cell1.style.color = "#ff0000";
				} else {
					cell1.textContent = "-----";
					cell2.textContent = "-----";
				}
			}
		}
	}
}

async function updateMatchHistory() {
	const nickname = await getNickOnLocalStorage();
	if (!nickname) return;

	try {
		const token = getCookie("token");
		// const response = await fetch(`${backendUrl}/player-matches/${nickname}`, {
		const response = await fetch(`${backendUrl}/player-matches/`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Get the match history table
		const table = document.getElementById("matchListId") as HTMLTableElement;

		if (!table) {
			console.error("Match history table not found!");
			return;
		}

		// Clear existing rows (except header)
		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		// Insert new rows for each match

		data.forEach((match) => {
			const row = table.insertRow();

			// Opponent column
			const opponentCell = row.insertCell();
			opponentCell.textContent = match.opponent;

			// Score column
			const scoreCell = row.insertCell();
			scoreCell.textContent = match.score;
			scoreCell.style.color = match.result === "WIN" ? "#4CAF50" : "#f44336"; // Green for win, red for loss
			scoreCell.style.fontWeight = "bold";

			// Date column
			const dateCell = row.insertCell();
			dateCell.textContent = match.date; // Assuming `match.date` is already formatted
			dateCell.style.textAlign = "center";
		});

		// Fill remaining rows with placeholders (if you want exactly 5 rows)
		const currentRows = table.rows.length - 1; // Subtract header row
		const maxRows = 5;

		for (let i = currentRows; i < maxRows; i++) {
			const row = table.insertRow();
			row.insertCell().textContent = "-----";
			row.insertCell().textContent = "-----";
			row.insertCell().textContent = "-----";
		}
	} catch (error) {
		console.error("Failed to load match history:", error);

		// Show error in table
		const table = document.getElementById("matchListId") as HTMLTableElement;
		if (table) {
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			const row = table.insertRow();
			const cell1 = row.insertCell();
			const cell2 = row.insertCell();
			const cell3 = row.insertCell();
			cell1.textContent = "Error loading matches";
			cell2.textContent = "-----";
			cell3.textContent = "-----";
			cell1.style.color = "#ff0000";
		}
	}
}

async function changeNickAPI(newNick: string): Promise<void> {
	const token = getCookie("token");
	try {
		const response = await fetch(`${backendUrl}/switch-nickname`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ nickname: newNick }),
		});

		const data = await response.json();
		if (!response.ok) {
			displayWarning(data.error || "Failed to switch nickname");
			return;
		} else {
			displayWarning("Nickname changed successfully!");
			localStorage.setItem("nickname", newNick);
			putNickOnProfileHeader(newNick);
			await getUserStats(newNick);
			location.reload();
		}
	} catch (error) {
		displayWarning((error as Error).message || "Error changing nickname");
	}
}

async function changePasswordAPI(newPassword: string, oldPassword: string): Promise<void> {
	const token = getCookie("token");
	try {
		const response = await fetch(`${backendUrl}/switch-password`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ oldPassword, newPassword }),
		});


		const data = await response.json();
		if (!response.ok) {
			displayWarning(data.error || "Failed to change password");
			return;
		} else {
			displayWarning("Password changed successfully!");
		}
	} catch (error) {
		displayWarning((error as Error).message || "Error changing password");
	}
}

async function changeEmailAPI(newEmail: string): Promise<void> {
	const token = localStorage.getItem("token");
	try {
		const response = await fetch(`${backendUrl}/switch-email`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ email: newEmail }),
		});

		const data = await response.json();

		if (!response.ok) {
			displayWarning(data.error || "Failed to switch email");
			return ;
		}

		displayWarning("Email changed successfully!");
	} catch (error: any) {
		const errorMessage = (error as Error).message || "Error changing email";
		displayWarning(errorMessage);
	}
}

// Fetch and set the user's avatar on the profile page
async function setProfileAvatar() {
	const token = localStorage.getItem("token");
	if (!token) return;
	try {
		const response = await fetch(`${backendUrl}/me/avatar`, {
			headers: { Authorization: `Bearer ${token}` },
			credentials: "include",
		});
		const data = await response.json();
		const avatarUrl = data.avatar.startsWith("/") ? backendUrl + data.avatar : data.avatar;
		const photoElements = document.querySelectorAll(".profilePhotoLocation");
		photoElements.forEach((el) => {
			if (el instanceof HTMLImageElement) {
				el.src = avatarUrl + "?t=" + Date.now(); // cache busting
			} else {
				(el as HTMLElement).style.backgroundImage = `url('${avatarUrl}?t=${Date.now()}')`;
			}
		});
	} catch (e) {
		// fucking
	}
}

// SPA: Always refresh avatar on profile page navigation
function handleProfilePageNavigation() {
	if (window.location.pathname.includes("perfil") || window.location.pathname.includes("profile")) {
		setProfileAvatar();
	}
}

// Listen for SPA navigation events
window.addEventListener("popstate", handleProfilePageNavigation);
window.addEventListener("pushstate", handleProfilePageNavigation);
window.addEventListener("replacestate", handleProfilePageNavigation);
// Also run on initial load
handleProfilePageNavigation();

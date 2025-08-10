let winsNumber = document.getElementById("boxWinsNumber");
let losesNumber = document.getElementById("boxLosesNumber");
let gamesNumber = document.getElementById("boxGamesNumber");
let positionNumber = document.getElementById("positionId");
let winRateText = document.getElementById("winRateTextId");
const backendUrl = `http://${window.location.hostname}:3000`;
const frontendUrl = `http://${window.location.hostname}:5173`;

const matchesProfile = document.querySelector(".matchesProfile") as HTMLElement;
const friendsProfile = document.querySelector(".friendsProfile") as HTMLElement;

let matchOpen = false;
let friendsOpen = false;
let isPlayingSoundMatch = false;
let isPlayingSoundFriends = false;

getUserStats(getNickOnLocalStorage());

async function flipboardNumberAnimation(target: string, targetBox) {
	targetBox.textContent = "";

	let flips = 50;
	let delay = 100;

	// Inicializa todos os dígitos como "0"
	const spans: HTMLSpanElement[] = [];
	for (let i = 0; i < target.length; i++) {
		const span = document.createElement("span");
		span.textContent = "0";
		targetBox.appendChild(span);
		spans.push(span);
	}

	// Array para controlar se o dígito já acertou
	const locked: boolean[] = new Array(target.length).fill(false);

	for (let f = 0; f < flips; f++) {
		let allLocked = true;
		for (let i = 0; i < target.length; i++) {
			if (!locked[i]) {
				const randomDigit = Math.floor(Math.random() * 10).toString();
				spans[i].textContent = randomDigit;
				if (randomDigit === target[i]) {
					locked[i] = true;
				} else {
					allLocked = false;
				}
			}
		}
		if (allLocked) break;
		await new Promise((res) => setTimeout(res, delay));
	}

	// Garante que todos os dígitos finais estão corretos
	for (let i = 0; i < target.length; i++) {
		spans[i].textContent = target[i];
	}
}

async function getUserPosition(): Promise<string> {
	const userNick = localStorage.getItem("nickname");
	try {
		const response = await fetch(`${backendUrl}/leaderboard/position/${userNick}`);
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
	if (checkIfLogged()) {
		fetch(`${backendUrl}/player-stats/${nickname}`)
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
				winRateText.textContent = "Current Winrate: " + stats.win_percentage;
			})
			.catch((error) => {
				console.error("Failed to fetch player stats:", error.message);
			});
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const profileOptions = document.getElementById("profileOptionsButtonID");
	const matchesButton = document.getElementById("matchesButtonID");
	const friendsButton = document.getElementById("friendsButtonID");
	const addFriendsButton = document.getElementById("addFriendId");
	const refreshMatchesButton = document.getElementById("refreshMatchId");

	const photoPopupButtom = document.getElementById("popupPhotoButtonID");
	const popupNickButton = document.getElementById("popupNickButtonID");
	const popupEmailButton = document.getElementById("popupEmailButtonID");
	const popupPasswordButton = document.getElementById("popupPasswordButtonID");

	const frontpagePopup = document.querySelector(".frontpagePopup");
	const nickpagePopup = document.querySelector(".nickpagePopup");
	// const frontpagePopupPage = document.querySelector(".frontpagePopup");

	// PROFILE OPTIONS
	profileOptions.addEventListener("click", () => {
		openPopup();
		// const nickInput = (document.getElementById("popupNewNick") as HTMLInputElement).value.trim();
		// displayWarning(nickInput);
	});

	// OPEN MATCH HISTORY
	matchesButton.addEventListener("click", () => {
		matchesAnimationHandler();
	});

	// OPEN FRIEND LIST
	friendsButton.addEventListener("click", async () => {
		await updateFriends();
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
		displayWarning("THIS REFRESH THE LIST");
	});

	// POPUP PHOTO BUTTOM
	photoPopupButtom.addEventListener("click", async () => {
		// changePopupTo()
	});

	// POPUP NICK BUTTOM
	popupNickButton.addEventListener("click", async () => {
		changePopupTo(frontpagePopup, nickpagePopup);
	});

	// POPUP EMAIL BUTTOM
	popupEmailButton.addEventListener("click", async () => {
		// changePopupTo()
	});

	// POPUP PASSWORK BUTTOM
	popupPasswordButton.addEventListener("click", async () => {
		// changePopupTo()
	});
});

function changePopupTo(remove, activate) {
	remove.classList.remove("displayPagePopup");
	activate.classList.add("displayPagePopup");
}

function addfriendHandler(friendNick: string) {
	//#TODO Make the logic of addfriend here!
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

async function matchesAnimationHandler() {
	if (!matchOpen && !isPlayingSoundMatch) {
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
		const response = await fetch(`${backendUrl}/friends`, {
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Get the friends table (not the leaderboard table)
		const table = document.getElementById("friendListId") as HTMLTableElement;

		if (!table) {
			console.error("Friends table not found!");
			return;
		}

		// Clear existing rows (except header)
		while (table.rows.length > 1) {
			table.deleteRow(1);
		}

		// Insert new rows for each friend
		data.friends.forEach((friend) => {
			const row = table.insertRow();

			const nameCell = row.insertCell();
			nameCell.textContent = friend.nickname;

			const statusCell = row.insertCell();
			if (friend.isOnline) {
				statusCell.innerHTML = '<span style="color: #063508ff;">🟢 Online</span>';
				statusCell.className = "online-status";
			} else {
				statusCell.innerHTML = '<span style="color: #757575;">🔴 Offline</span>';
				statusCell.className = "offline-status";
			}
		});

		// Fill remaining rows with placeholders
		const currentRows = table.rows.length - 1;
		const maxRows = 5;

		for (let i = currentRows; i < maxRows; i++) {
			const row = table.insertRow();
			row.insertCell().textContent = "-----";
			row.insertCell().textContent = "-----";
		}
	} catch (error) {
		// Show error in table
		const table = document.getElementById("friendListId") as HTMLTableElement;
		if (table) {
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
			const row = table.insertRow();
			const cell1 = row.insertCell();
			const cell2 = row.insertCell();
			cell1.textContent = "Error loading friends";
			cell2.textContent = `${error}`;
			cell1.style.color = "#ff0000";
		}
	}
}
